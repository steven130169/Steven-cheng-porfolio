import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketTypes = pgTable('ticket_types', {
    id: serial('id').primaryKey(),
    eventId: serial('event_id').references(() => events.id),
    name: varchar('name', { length: 255 }).notNull(),
    price: serial('price').notNull(),
    inventory: serial('inventory').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    totalAmount: serial('total_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
