import {z} from 'zod';

/**
 * Schema definition for creating a reservation.
 *
 * This schema validates the following fields:
 * - `eventId`: A required positive integer representing the ID of the event.
 * - `ticketTypeId`: A required positive integer representing the ID of the ticket type.
 * - `quantity`: A required integer between 1 and 10 (inclusive), representing the number of tickets being reserved.
 * - `customerEmail`: A required string that must be a valid email address.
 */
export const createReservationSchema = z.object({
    eventId: z.number().int().positive(),
    ticketTypeId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10),
    customerEmail: z.email(),
});

/**
 * Represents the input data required to create a reservation.
 *
 * This type is inferred from the `createReservationSchema` and is used to ensure
 * that the input data adheres to the expected schema. It includes all necessary
 * fields for reservation creation, as defined in the schema.
 *
 * Utilize this type to validate and type-check the reservation input data in
 * the application.
 */
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
