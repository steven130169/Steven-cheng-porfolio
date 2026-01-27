import {db} from '@/server/db';
import {events} from '@/server/db/schema';
import {
    createEventSchema,
    updateEventSchema,
    type CreateEventInput,
    type UpdateEventInput
} from '@/server/validators/event.schema';
import slugify from 'slugify';
import {eq, and, ne} from 'drizzle-orm';
import {getTotalAllocated} from '@/server/services/ticket-type';

export async function createDraftEvent(input: CreateEventInput) {
    // Validate input
    const validatedData = createEventSchema.parse(input);

    // Generate slug
    const slug = slugify(validatedData.title, {lower: true, strict: true});

    // Check slug uniqueness
    const existing = await db
        .select({id: events.id})
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);

    if (existing.length > 0) {
        throw new Error('Event with this title already exists');
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

    return event;
}

async function validateCapacityUpdate(
    eventId: number,
    event: typeof events.$inferSelect,
    newCapacity: number
): Promise<void> {
    if (event.status === 'PUBLISHED') {
        if (newCapacity < event.totalCapacity) {
            throw new Error('Cannot decrease capacity for published event');
        }
    } else if (event.status === 'DRAFT') {
        const totalAllocated = await getTotalAllocated(eventId);

        if (newCapacity < totalAllocated) {
            throw new Error(`New capacity must be >= total allocations: ${totalAllocated}`);
        }
    }
}

async function validateAndGenerateSlug(title: string, eventId: number): Promise<string> {
    const newSlug = slugify(title, {lower: true, strict: true});

    const existing = await db
        .select({id: events.id})
        .from(events)
        .where(and(
            eq(events.slug, newSlug),
            ne(events.id, eventId)
        ))
        .limit(1);

    if (existing.length > 0) {
        throw new Error('Event with this title already exists');
    }

    return newSlug;
}

export async function updateEvent(eventId: number, input: UpdateEventInput) {
    const validatedData = updateEventSchema.parse(input);

    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) {
        throw new Error('Event not found');
    }

    const updateData: Partial<typeof events.$inferInsert> = {
        updatedAt: new Date(),
    };

    if (validatedData.totalCapacity !== undefined) {
        await validateCapacityUpdate(eventId, event, validatedData.totalCapacity);
        updateData.totalCapacity = validatedData.totalCapacity;
    }

    if (validatedData.title) {
        const newSlug = await validateAndGenerateSlug(validatedData.title, eventId);
        updateData.slug = newSlug;
        updateData.title = validatedData.title;
    }

    if (validatedData.description !== undefined) {
        updateData.description = validatedData.description;
    }

    if (validatedData.eventDate !== undefined) {
        updateData.eventDate = validatedData.eventDate ? new Date(validatedData.eventDate) : null;
    }

    const [updatedEvent] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();

    return updatedEvent;
}
