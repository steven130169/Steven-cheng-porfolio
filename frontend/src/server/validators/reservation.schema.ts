import {z} from 'zod';

export const createReservationSchema = z.object({
    eventId: z.number().int().positive(),
    ticketTypeId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10),
    customerEmail: z.email(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
