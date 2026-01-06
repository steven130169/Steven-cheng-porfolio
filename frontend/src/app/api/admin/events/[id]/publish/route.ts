import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { events, ticketTypes } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Check if event can be published
 */
async function canPublishEvent(eventId: number): Promise<{ canPublish: boolean; reason?: string }> {
  // Check if event has at least one enabled ticket type
  const enabledTicketTypes = await db
    .select()
    .from(ticketTypes)
    .where(and(
      eq(ticketTypes.eventId, eventId),
      eq(ticketTypes.enabled, true)
    ));

  if (enabledTicketTypes.length === 0) {
    return {
      canPublish: false,
      reason: 'At least one enabled ticket type is required',
    };
  }

  return { canPublish: true };
}

/**
 * POST /api/admin/events/:id/publish
 * Publish an event (change status from DRAFT to PUBLISHED)
 */
export async function POST(
  _request: NextRequest,
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

    // Check if event exists
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

    // Check if already published
    if (event.status === 'PUBLISHED') {
      return NextResponse.json(
        {
          id: event.id,
          status: 'PUBLISHED',
          publishedAt: event.updatedAt,
        },
        { status: 200 }
      );
    }

    // Validate prerequisites
    const publishCheck = await canPublishEvent(eventId);
    if (!publishCheck.canPublish) {
      return NextResponse.json(
        { error: publishCheck.reason },
        { status: 400 }
      );
    }

    // Update event status
    const [updatedEvent] = await db
      .update(events)
      .set({
        status: 'PUBLISHED',
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();

    return NextResponse.json(
      {
        id: updatedEvent.id,
        status: updatedEvent.status,
        publishedAt: updatedEvent.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error publishing event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
