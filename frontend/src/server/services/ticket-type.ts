import {db} from '@/server/db';
import {events, ticketTypes} from '@/server/db/schema';
import {eq, and, isNotNull} from 'drizzle-orm';

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

    // 3. Insert ticket type into database
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
