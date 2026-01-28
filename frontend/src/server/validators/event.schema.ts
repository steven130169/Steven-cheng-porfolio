import { z } from 'zod';

/**
 * Schema definition for creating an event using Zod.
 *
 * This schema validates the structure and constraints of an event object.
 * It ensures the required properties are provided and conform to specific
 * data types and constraints.
 *
 * Properties:
 * - title: A required string field that must contain at least one character and
 *   cannot exceed 255 characters.
 * - description: An optional string field for providing additional details about the event.
 * - totalCapacity: A required positive integer that represents the maximum number of
 *   participants allowed for the event.
 * - eventDate: An optional ISO 8601 datetime string representing the scheduled date and time of the event.
 */
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  totalCapacity: z.number().int().positive('Total capacity must be a positive integer'),
  eventDate: z.iso.datetime().optional(),
});

/**
 * Schema for updating an event.
 *
 * This schema defines the structure and validation rules for updating event details.
 * All properties are optional to allow partial updates.
 *
 * Properties:
 * - `title` (optional): A string representing the title of the event. The title must have
 *   a minimum length of 1 character and a maximum length of 255 characters.
 * - `description` (optional): A string containing the description of the event.
 * - `totalCapacity` (optional): A positive integer representing the total capacity for the event.
 * - `eventDate` (optional): An ISO 8601 formatted datetime string representing the event's date and time.
 */
export const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  totalCapacity: z.number().int().positive().optional(),
  eventDate: z.iso.datetime().optional(),
});

/**
 * Schema definition for creating a ticket type.
 *
 * The schema validates the structure and rules for a ticket type, ensuring
 * the provided data adheres to the required constraints.
 *
 * Properties:
 * - `name`: A required string representing the name of the ticket type. Must be between 1 and 255 characters.
 * - `price`: A required non-negative integer representing the price of the ticket in cents.
 * - `allocation`: An optional positive integer indicating the allocation for this ticket type. Can be set to null.
 * - `enabled`: A boolean indicating whether the ticket type is enabled. Defaults to true.
 */
export const createTicketTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  price: z.number().int().nonnegative('Price must be non-negative (in cents)'),
  allocation: z.number().int().positive('Allocation must be a positive integer').nullable().optional(),
  enabled: z.boolean().default(true),
});

/**
 * Schema definition for updating a ticket type.
 *
 * This schema is used to validate the properties of a ticket type
 * that can be updated. All fields are optional, allowing partial updates.
 *
 * Properties:
 * - `name` (optional): The name of the ticket type, which must be a string
 *   with a minimum length of 1 and a maximum length of 255.
 * - `price` (optional): The price of the ticket type, which must be
 *   a non-negative integer.
 * - `allocation` (optional): The allocation for the ticket type, which must
 *   be a positive integer or null.
 * - `enabled` (optional): A boolean indicating whether the ticket type
 *   is enabled.
 */
export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price: z.number().int().nonnegative().optional(),
  allocation: z.number().int().positive().nullable().optional(),
  enabled: z.boolean().optional(),
});

/**
 * Represents the input required to create an event.
 *
 * `CreateEventInput` is a TypeScript type derived from a Zod schema.
 * This type ensures that the input data matches the validation rules specified in the `createEventSchema`.
 * It is used to strongly type data during event creation processes and helps prevent invalid input.
 *
 * This type is commonly used for validating request payloads and ensuring type safety in functions and API endpoints related to event creation.
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Represents the input data required to update an event.
 *
 * This type is derived from the validation schema `updateEventSchema`.
 * It defines the structure and validation rules for the data that can be used
 * when updating an existing event in the system.
 *
 * The schema ensures input consistency and constraints are enforced programmatically.
 */
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
/**
 * Represents the input required to create a ticket type.
 *
 * This type is inferred from the schema `createTicketTypeSchema`
 * and ensures that the structure of the input adheres to the
 * defined validation and constraints.
 *
 * Use this type to define the shape of data when creating a
 * new ticket type and to maintain consistency across the
 * application.
 */
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
/**
 * Represents the input data structure for updating a ticket type.
 * This type is derived from the validation schema `updateTicketTypeSchema`
 * and enforces the structure and rules defined within the schema.
 *
 * The `UpdateTicketTypeInput` is used to ensure that any updates
 * to ticket types align with the expected format and constraints.
 *
 * Usage of this type helps maintain data consistency and ensures
 * validation at the point of use in the application.
 */
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
