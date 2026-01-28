import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {createReservationSchema, type CreateReservationInput} from '@/server/validators/reservation.schema';
import {eq, and, sum} from 'drizzle-orm';

const RESERVATION_EXPIRY_MINUTES = 15;

async function getAvailableInventory(eventId: number, ticketTypeId: number): Promise<number> {
    // Get ticket type allocation
    const [ticketType] = await db
        .select()
        .from(ticketTypes)
        .where(eq(ticketTypes.id, ticketTypeId))
        .limit(1);

    if (!ticketType) {
        throw new Error('Ticket type not found');
    }

    // Get event total capacity
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) {
        throw new Error('Event not found');
    }

    // Calculate reserved quantity (ACTIVE reservations only)
    const [result] = await db
        .select({total: sum(reservations.quantity)})
        .from(reservations)
        .where(
            and(
                eq(reservations.eventId, eventId),
                eq(reservations.status, 'ACTIVE')
            )
        );

    const totalReserved = Number(result.total) || 0;

    // Available = MIN(ticket allocation, event capacity) - reserved
    const capacity = ticketType.allocation ?? event.totalCapacity;
    return Math.max(0, capacity - totalReserved);
}

export async function createReservation(input: CreateReservationInput) {
    const validatedData = createReservationSchema.parse(input);

    // Check inventory availability
    const available = await getAvailableInventory(validatedData.eventId, validatedData.ticketTypeId);
    if (available < validatedData.quantity) {
        throw new Error('Insufficient Inventory');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

    const [reservation] = await db
        .insert(reservations)
        .values({
            eventId: validatedData.eventId,
            ticketTypeId: validatedData.ticketTypeId,
            quantity: validatedData.quantity,
            customerEmail: validatedData.customerEmail,
            status: 'ACTIVE',
            expiresAt,
        })
        .returning();

    return reservation;
}
