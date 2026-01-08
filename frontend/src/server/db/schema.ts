import { pgTable, serial, text, timestamp, varchar, integer, boolean, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    totalCapacity: integer('total_capacity').notNull(),
    eventDate: timestamp('event_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    check('check_status', sql.raw(`${table.status.name} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`)),
    check('check_total_capacity', sql.raw(`${table.totalCapacity.name} > 0`)),
]);

export const ticketTypes = pgTable('ticket_types', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    price: integer('price').notNull(),
    allocation: integer('allocation'),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Orders table for event ticketing system
 * Part of the event ticketing and commerce engine (ADR-0012)
 */
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    totalAmount: integer('total_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Database schema exports
 * All tables are part of the application's data model
 */
export const schema = {
    events,
    ticketTypes,
    orders,
} as const;
