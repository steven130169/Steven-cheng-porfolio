import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {createReservationSchema, type CreateReservationInput} from '@/server/validators/reservation.schema';
import {eq, and, sum} from 'drizzle-orm';

const RESERVATION_EXPIRY_MINUTES = 15;

/**
 * Creates a reservation for a specified event and ticket type, locking inventory to prevent race conditions.
 *
 * @param {CreateReservationInput} input - The input data required to create a reservation. Includes event ID, ticket type ID, quantity, and customer email.
 * @return {Promise<object>} A promise that resolves to the created reservation object.
 * @throws {Error} If the ticket type or event is not found, or if there is insufficient inventory available.
 */
export async function createReservation(input: CreateReservationInput): Promise<typeof reservations.$inferInsert> {
    const validatedData = createReservationSchema.parse(input);

    return await db.transaction(async (tx) => {
        // Lock the ticket type row to prevent race conditions
        const [ticketType] = await tx
            .select()
            .from(ticketTypes)
            .where(eq(ticketTypes.id, validatedData.ticketTypeId))
            .for('update') // Pessimistic lock
            .limit(1);

        if (!ticketType) {
            throw new Error('Ticket type not found');
        }

        // Get event
        const [event] = await tx
            .select()
            .from(events)
            .where(eq(events.id, validatedData.eventId))
            .limit(1);

        if (!event) {
            throw new Error('Event not found');
        }

        // Calculate available inventory within a transaction
        const [result] = await tx
            .select({total: sum(reservations.quantity)})
            .from(reservations)
            .where(
                and(
                    eq(reservations.eventId, validatedData.eventId),
                    eq(reservations.status, 'ACTIVE')
                )
            );

        const totalReserved = Number(result.total) || 0;
        const capacity = ticketType.allocation ?? event.totalCapacity;
        const available = Math.max(0, capacity - totalReserved);

        if (available < validatedData.quantity) {
            throw new Error('Insufficient Inventory');
        }

        // Create reservation
        const now = new Date();
        const expiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

        const [reservation] = await tx
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
    });
}
