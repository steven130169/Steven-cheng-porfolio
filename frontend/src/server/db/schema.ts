import {boolean, check, integer, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

/**
 * Represents the `events` database table structure.
 *
 * Table Columns:
 * - id: Unique identifier for each event. This is a primary key and auto-incremented.
 * - title: The title of the event. This is a required field and cannot be null.
 * - description: A textual description of the event. This is optional.
 * - slug: A URL-friendly, unique identifier for the event. This is required and limited to 255 characters.
 * - status: The publication status of the event. It is required, with a default value of 'DRAFT'.
 *           Allowed values are 'DRAFT', 'PUBLISHED', or 'ARCHIVED'.
 * - totalCapacity: The maximum number of participants allowed for this event. This is a required field and must be greater than 0.
 * - eventDate: The date and time when the event is scheduled to occur. This is optional.
 * - createdAt: The date and time when the event was created. This is auto-generated and cannot be null.
 * - updatedAt: The date and time when the event was last updated. This is auto-generated and cannot be null.
 *
 * Table Constraints:
 * - check_status: Ensures that the `status` column has one of the allowed values: 'DRAFT', 'PUBLISHED', 'ARCHIVED'.
 * - check_total_capacity: Ensures that the `totalCapacity` column has a value greater than 0.
 */
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    slug: varchar('slug', {length: 255}).notNull().unique(),
    status: varchar('status', {length: 20}).notNull().default('DRAFT'),
    totalCapacity: integer('total_capacity').notNull(),
    eventDate: timestamp('event_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    check('check_status', sql.raw(`${table.status.name} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`)),
    check('check_total_capacity', sql.raw(`${table.totalCapacity.name} > 0`)),
]);

/**
 * Represents the database table 'ticket_types' which stores information
 * related to various types of tickets for events.
 *
 * Fields:
 * - `id`: A unique identifier for each ticket type. This is the primary key.
 * - `eventId`: A foreign key referencing the `id` of the associated event.
 *   Enforces a cascade delete when the associated event is deleted.
 * - `name`: The name of the ticket type, with a maximum length of 255 characters.
 * - `price`: The price of the ticket type, stored as an integer.
 * - `allocation`: The number of tickets allocated for this ticket type. Optional field.
 * - `enabled`: Indicates whether the ticket type is available. Defaults to true.
 * - `createdAt`: The timestamp when the ticket type was created. Automatically set to the current time and is non-nullable.
 */
export const ticketTypes = pgTable('ticket_types', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').notNull().references(() => events.id, {onDelete: 'cascade'}),
    name: varchar('name', {length: 255}).notNull(),
    price: integer('price').notNull(),
    allocation: integer('allocation'),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Represents the 'orders' database table structure and its columns.
 *
 * Properties:
 * - `id`: A unique identifier for each order, set as the primary key.
 * - `customerEmail`: The email address of the customer associated with the order. This field cannot be null and has a maximum length of 255 characters.
 * - `status`: The current status of the order. This field cannot be null, has a maximum length of 50 characters, and defaults to 'pending' if not specified.
 * - `totalAmount`: The total monetary amount for the order. This field cannot be null.
 * - `createdAt`: The timestamp indicating when the order was created. This field is automatically set to the current time by default and cannot be null.
 */
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    customerEmail: varchar('customer_email', {length: 255}).notNull(),
    status: varchar('status', {length: 50}).notNull().default('pending'),
    totalAmount: integer('total_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Represents the database table `reservations` with the following properties:
 *
 * id: The primary key of the reservation, represented as a serial integer.
 *
 * eventId: A foreign key linking to the `id` column of the `events` table. Represents the event associated with the reservation.
 *          This field is non-nullable. Deleting the associated event will cascade and delete related reservations.
 *
 * ticketTypeId: A foreign key linking to the `id` column of the `ticketTypes` table. Represents the type of ticket reserved.
 *               This field is non-nullable. Deleting the associated ticket type will cascade and delete related reservations.
 *
 * quantity: An integer representing the number of tickets reserved. This field is non-nullable.
 *           The value must be greater than 0, enforced by a constraint check.
 *
 * customerEmail: A string representing the email of the customer making the reservation.
 *                It has a maximum length of 255 characters and is non-nullable.
 *
 * status: A string representing the status of the reservation. The status can only be one of the
 *         following values: 'ACTIVE', 'CONSUMED', 'EXPIRED'. The default value is 'ACTIVE'.
 *         This field has a maximum length of 20 characters and is non-nullable.
 *
 * expiresAt: A timestamp indicating when the reservation expires. This field is non-nullable.
 *
 * createdAt: A timestamp indicating when the reservation was created. Defaults to the current timestamp
 *            at the time of record creation and is non-nullable.
 *
 * Constraints:
 * - `check_quantity`: Ensures that the `quantity` field is greater than 0.
 * - `check_status`: Ensures that the `status` field is one of the allowed values ('ACTIVE', 'CONSUMED', 'EXPIRED').
 */
export const reservations = pgTable('reservations', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').notNull().references(() => events.id, {onDelete: 'cascade'}),
    ticketTypeId: integer('ticket_type_id').notNull().references(() => ticketTypes.id, {onDelete: 'cascade'}),
    quantity: integer('quantity').notNull(),
    customerEmail: varchar('customer_email', {length: 255}).notNull(),
    status: varchar('status', {length: 20}).notNull().default('ACTIVE'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    check('check_quantity', sql.raw(`${table.quantity.name} > 0`)),
    check('check_status', sql.raw(`${table.status.name} IN ('ACTIVE', 'CONSUMED', 'EXPIRED')`)),
]);
export const schema = {
    events,
    ticketTypes,
    orders,
    reservations,
} as const;
