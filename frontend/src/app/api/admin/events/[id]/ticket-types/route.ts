import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { events, ticketTypes } from '@/server/db/schema';
import { createTicketTypeSchema } from '@/server/validators/event.schema';
import { eq, and, isNotNull } from 'drizzle-orm';

/**
 * Validate that total allocations don't exceed event capacity
 */
async function validateAllocations(eventId: number, newAllocation: number | null): Promise<{ valid: boolean; error?: string }> {
  // Get event
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return { valid: false, error: 'Event not found' };
  }

  // Get existing ticket types with allocations
  const existingTicketTypes = await db
    .select()
    .from(ticketTypes)
    .where(and(
      eq(ticketTypes.eventId, eventId),
      isNotNull(ticketTypes.allocation)
    ));

  // Calculate total allocated
  const existingAllocated = existingTicketTypes.reduce(
    (sum, tt) => sum + (tt.allocation || 0),
    0
  );

  const totalAllocated = existingAllocated + (newAllocation || 0);

  if (newAllocation && totalAllocated > event.totalCapacity) {
    return {
      valid: false,
      error: 'Allocations exceed total capacity',
    };
  }

  return { valid: true };
}

/**
 * POST /api/admin/events/:id/ticket-types
 * Add a ticket type to an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = Number.parseInt(id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body = await request.json() as unknown;

    // Validate input
    const validatedData = createTicketTypeSchema.parse(body);

    // Check if event exists and is DRAFT
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot modify published event' },
        { status: 403 }
      );
    }

    // Validate allocations
    const allocationCheck = await validateAllocations(eventId, validatedData.allocation ?? null);
    if (!allocationCheck.valid) {
      return NextResponse.json(
        { error: allocationCheck.error },
        { status: 400 }
      );
    }

    // Create ticket type
    const [ticketType] = await db
      .insert(ticketTypes)
      .values({
        eventId,
        name: validatedData.name,
        price: validatedData.price,
        allocation: validatedData.allocation ?? null,
        enabled: validatedData.enabled,
      })
      .returning();

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    // Database or other errors
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
