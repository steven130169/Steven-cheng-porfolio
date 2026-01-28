import {db} from '@/server/db';
import {events, ticketTypes} from '@/server/db/schema';
import {eq, and, isNotNull} from 'drizzle-orm';

/**
 * Creates a new ticket type for a specified event.
 *
 * @param {Object} input - The details of the ticket type to be created.
 * @param {number} input.eventId - The unique identifier of the event for which the ticket type is being created.
 * @param {string} input.name - The name of the ticket type.
 * @param {number} input.price - The price of the ticket type.
 * @param {number|null} input.allocation - The number of tickets allocated for this type, or `null` for unrestricted allocation.
 * @param {boolean} input.enabled - A flag indicating whether the ticket type is enabled and available for purchase.
 * @return {Promise<Object>} Returns a Promise that resolves to the created ticket type object.
 * @throws {Error} If the specified event does not exist.
 * @throws {Error} If the total allocation exceeds the event's total capacity.
 */
export async function createTicketType(input: {
    eventId: number;
    name: string;
    price: number;
    allocation: number | null;
    enabled: boolean;
}): Promise<typeof ticketTypes.$inferSelect> {
    // 1. Validate event exists
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);

    if (!event) {
        throw new Error('Event not found');
    }

    // 2. Validate new allocation + existing <= event.totalCapacity
    const existingAllocated = await getTotalAllocated(input.eventId);
    const totalAllocated = existingAllocated + (input.allocation || 0);

    if (input.allocation && totalAllocated > event.totalCapacity) {
        throw new Error('Allocations exceed total capacity');
    }

    // 3. Insert a ticket type into a database
    const [ticketType] = await db
        .insert(ticketTypes)
        .values({
            eventId: input.eventId,
            name: input.name,
            price: input.price,
            allocation: input.allocation,
            enabled: input.enabled,
        })
        .returning();

    // 4. Return created ticket type
    return ticketType;
}

/**
 * Calculates the total number of allocated tickets for a given event.
 *
 * @param eventId The unique identifier of the event for which the total allocated tickets are to be calculated.
 * @return A promise that resolves to the total number of allocated tickets for the specified event.
 */
export async function getTotalAllocated(eventId: number): Promise<number> {
    const allocatedTicketTypes = await db
        .select()
        .from(ticketTypes)
        .where(
            and(
                eq(ticketTypes.eventId, eventId),
                isNotNull(ticketTypes.allocation)
            )
        );

    return allocatedTicketTypes
        .filter((tt): tt is typeof tt & { allocation: number } => tt.allocation !== null)
        .reduce((sum, tt) => sum + tt.allocation, 0);
}
