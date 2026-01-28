import {db} from '@/server/db';
import {orders, reservations, ticketTypes} from '@/server/db/schema';
import {eq} from 'drizzle-orm';

/**
 * Creates an order from an existing reservation.
 * Validates that the reservation exists, is active, and has not expired.
 * After creating the order, marks the reservation as CONSUMED.
 *
 * @param {number} reservationId - The ID of the reservation to convert into an order
 * @return {Promise<object>} The created order object
 * @throws {Error} If reservation is not found, already consumed, expired, or time has passed
 */
export async function createOrderFromReservation(reservationId: number) {
    return await db.transaction(async (tx) => {
        // Get reservation within transaction
        const [reservation] = await tx
            .select()
            .from(reservations)
            .where(eq(reservations.id, reservationId))
            .limit(1);

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        // Check if reservation is already consumed or expired
        if (reservation.status === 'CONSUMED' || reservation.status === 'EXPIRED') {
            throw new Error('Reservation already consumed or expired');
        }

        // Check if reservation time has passed
        const now = new Date();
        if (reservation.expiresAt < now) {
            throw new Error('Reservation has expired');
        }

        // Get ticket type price
        const [ticketType] = await tx
            .select()
            .from(ticketTypes)
            .where(eq(ticketTypes.id, reservation.ticketTypeId))
            .limit(1);

        if (!ticketType) {
            throw new Error('Ticket type not found');
        }

        // Calculate total amount
        const totalAmount = ticketType.price * reservation.quantity;

        // Create order
        const [order] = await tx
            .insert(orders)
            .values({
                customerEmail: reservation.customerEmail,
                status: 'pending',
                totalAmount,
            })
            .returning();

        // Mark reservation as consumed
        await tx
            .update(reservations)
            .set({status: 'CONSUMED'})
            .where(eq(reservations.id, reservationId));

        return order;
    });
}
