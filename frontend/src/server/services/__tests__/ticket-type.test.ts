import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import {db} from '@/server/db';
import {events, ticketTypes} from '@/server/db/schema';
import {sql} from 'drizzle-orm';
import {createTicketType, getTotalAllocated} from '../ticket-type';

describe('createTicketType', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should create ticket type with allocation', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        const result = await createTicketType({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: true,
        });

        expect(result.name).toBe('Early Bird');
        expect(result.price).toBe(100);
        expect(result.allocation).toBe(10);
        expect(result.enabled).toBe(true);
        expect(result.eventId).toBe(event.id);
    });

    it('should create ticket type without allocation (null)', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        const result = await createTicketType({
            eventId: event.id,
            name: 'General',
            price: 150,
            allocation: null,
            enabled: true,
        });

        expect(result.name).toBe('General');
        expect(result.allocation).toBeNull();
        expect(result.enabled).toBe(true);
    });

    it('should reject when allocation exceeds remaining capacity', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 8,
            enabled: true,
        });

        await expect(
            createTicketType({
                eventId: event.id,
                name: 'VIP',
                price: 300,
                allocation: 5,
                enabled: true,
            })
        ).rejects.toThrow('Allocations exceed total capacity');
    });

    it('should allow when allocation fits within remaining capacity', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 5,
            enabled: true,
        });

        const result = await createTicketType({
            eventId: event.id,
            name: 'General',
            price: 150,
            allocation: 5,
            enabled: true,
        });

        expect(result.allocation).toBe(5);
        expect(result.eventId).toBe(event.id);
    });

    it('should allow mixed allocations (some null, some defined)', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 8,
            enabled: true,
        });

        const result = await createTicketType({
            eventId: event.id,
            name: 'General',
            price: 150,
            allocation: null,
            enabled: true,
        });

        expect(result.allocation).toBeNull();
        expect(result.enabled).toBe(true);
    });

    it('should reject when event not found', async () => {
        await expect(
            createTicketType({
                eventId: 999,
                name: 'VIP',
                price: 300,
                allocation: 10,
                enabled: true,
            })
        ).rejects.toThrow('Event not found');
    });

    it('should allow creating ticket type for PUBLISHED event', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 5,
            enabled: true,
        });

        const result = await createTicketType({
            eventId: event.id,
            name: 'General',
            price: 150,
            allocation: 5,
            enabled: true,
        });

        expect(result.allocation).toBe(5);
        expect(result.eventId).toBe(event.id);
    });
});

describe('getTotalAllocated', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should sum only non-null allocations for an event', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 100,
        }).returning();

        await db.insert(ticketTypes).values([
            {eventId: event.id, name: 'Early Bird', price: 100, allocation: 30, enabled: true},
            {eventId: event.id, name: 'VIP', price: 300, allocation: 20, enabled: true},
            {eventId: event.id, name: 'General', price: 150, allocation: null, enabled: true},
        ]);

        const total = await getTotalAllocated(event.id);

        expect(total).toBe(50);
    });

    it('should return 0 when no ticket types have allocations', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 100,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'General',
            price: 150,
            allocation: null,
            enabled: true,
        });

        const total = await getTotalAllocated(event.id);

        expect(total).toBe(0);
    });

    it('should return 0 when event has no ticket types', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 100,
        }).returning();

        const total = await getTotalAllocated(event.id);

        expect(total).toBe(0);
    });
});
