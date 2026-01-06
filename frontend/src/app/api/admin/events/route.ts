import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { events } from '@/server/db/schema';
import { createEventSchema } from '@/server/validators/event.schema';
import slugify from 'slugify';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/events
 * Create a new draft event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as unknown;

    // Validate input
    const validatedData = createEventSchema.parse(body);

    // Generate unique slug
    const baseSlug = slugify(validatedData.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness
    while (true) {
      const existing = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create event
    const [event] = await db
      .insert(events)
      .values({
        slug,
        title: validatedData.title,
        description: validatedData.description,
        status: 'DRAFT',
        totalCapacity: validatedData.totalCapacity,
        eventDate: validatedData.eventDate ? new Date(validatedData.eventDate) : null,
      })
      .returning();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    // Database or other errors
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
