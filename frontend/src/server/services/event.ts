import {db} from '@/server/db';
import {events, ticketTypes} from '@/server/db/schema';
import {
    type CreateEventInput,
    createEventSchema,
    type UpdateEventInput,
    updateEventSchema
} from '@/server/validators/event.schema';
import slugify from 'slugify';
import {and, eq, ne} from 'drizzle-orm';
import {getTotalAllocated} from '@/server/services/ticket-type';

/**
 * Creates a draft event by validating input data, generating a unique slug, and inserting the event into the database.
 *
 * @param {CreateEventInput} input - The input data for creating the draft event, including title, description, status, total capacity, and optional event date.
 * @return {Promise<Object>} A promise that resolves to the created draft event object.
 */
export async function createDraftEvent(input: CreateEventInput): Promise<typeof events.$inferInsert> {
    // Validate input
    const validatedData = createEventSchema.parse(input);

    // Generate and validate slug
    const slug = await validateAndGenerateSlug(validatedData.title);

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

/**
 * Validates the uniqueness of a slug generated from the provided title and event ID
 * and returns the generated slug if it is unique.
 *
 * @param {string} title - The title from which the slug is generated.
 * @param {number} [eventId] - The optional ID of the event, used to exclude the current event from uniqueness validation.
 * @return {Promise<string>} A promise that resolves to the generated unique slug.
 * @throws {Error} If a slug generated from the title already exists for another event.
 */
async function validateAndGenerateSlug(title: string, eventId?: number): Promise<string> {
    const newSlug = slugify(title, {lower: true, strict: true});

    const conditions = [eq(events.slug, newSlug)];
    if (eventId !== undefined) {
        conditions.push(ne(events.id, eventId));
    }

    const existing = await db
        .select({id: events.id})
        .from(events)
        .where(and(...conditions))
        .limit(1);

    if (existing.length > 0) {
        throw new Error('Event with this slug already exists');
    }

    return newSlug;
}

/**
 * Updates the details of an existing event.
 *
 * @param {number} eventId - The unique identifier of the event to update.
 * @param {UpdateEventInput} input - An object containing the updated event details.
 * @return {Promise<Object>} A promise that resolves to the updated event object.
 * @throws {Error} Throws an error if the event is not found or if the input is invalid.
 */
export async function updateEvent(eventId: number, input: UpdateEventInput): Promise<typeof events.$inferInsert> {
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
        updateData.slug = await validateAndGenerateSlug(validatedData.title, eventId);
        updateData.title = validatedData.title;
    }

    if (validatedData.description !== undefined) {
        updateData.description = validatedData.description;
    }

    if (validatedData.eventDate !== undefined) {
        updateData.eventDate = new Date(validatedData.eventDate)
    }

    const [updatedEvent] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();

    return updatedEvent;
}

/**
 * Publishes an event by updating its status to "PUBLISHED".
 * The event must exist and have at least one enabled ticket type to be published.
 *
 * @param {number} eventId - The unique identifier of the event to be published.
 * @return {Promise<object>} A promise that resolves to the updated event object after publishing.
 * @throws {Error} If the event does not exist.
 * @throws {Error} If there are no enabled ticket types for the event.
 */
export async function publishEvent(eventId: number): Promise<typeof events.$inferInsert> {
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) {
        throw new Error('Event not found');
    }

    // Already published — return as-is (idempotent)
    if (event.status === 'PUBLISHED') {
        return event;
    }

    // Check at least one enabled ticket type exists
    const enabledTicketTypes = await db
        .select()
        .from(ticketTypes)
        .where(and(
            eq(ticketTypes.eventId, eventId),
            eq(ticketTypes.enabled, true)
        ));

    if (enabledTicketTypes.length === 0) {
        throw new Error('At least one enabled ticket type is required');
    }

    // Update status to PUBLISHED
    const [updatedEvent] = await db
        .update(events)
        .set({
            status: 'PUBLISHED',
            updatedAt: new Date(),
        })
        .where(eq(events.id, eventId))
        .returning();

    return updatedEvent;
}
