import { db } from '@/server/db';
import { reservations } from '@/server/db/schema';
import { createReservationSchema, type CreateReservationInput } from '@/server/validators/reservation.schema';

const RESERVATION_EXPIRY_MINUTES = 15;

export async function createReservation(input: CreateReservationInput) {
  const validatedData = createReservationSchema.parse(input);

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
