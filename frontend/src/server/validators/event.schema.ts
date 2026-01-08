import { z } from 'zod';

/**
 * Schema for creating a new draft event
 */
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  totalCapacity: z.number().int().positive('Total capacity must be a positive integer'),
  eventDate: z.iso.datetime().optional(),
});

/**
 * Schema for updating an existing event
 */
export const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  totalCapacity: z.number().int().positive().optional(),
  eventDate: z.iso.datetime().optional(),
});

/**
 * Schema for creating a ticket type
 */
export const createTicketTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  price: z.number().int().nonnegative('Price must be non-negative (in cents)'),
  allocation: z.number().int().positive('Allocation must be a positive integer').nullable().optional(),
  enabled: z.boolean().default(true),
});

/**
 * Schema for updating a ticket type
 */
export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price: z.number().int().nonnegative().optional(),
  allocation: z.number().int().positive().nullable().optional(),
  enabled: z.boolean().optional(),
});

/**
 * Type exports for TypeScript usage
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
