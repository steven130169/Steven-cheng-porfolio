import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import {db} from '@/server/db';
import {events, ticketTypes} from '@/server/db/schema';
import {sql} from 'drizzle-orm';
import {createDraftEvent, updateEvent, publishEvent} from '../event';

describe('createDraftEvent', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should create draft event with generated slug', async () => {
        const result = await createDraftEvent({
            title: 'Tech Conf 2025',
            totalCapacity: 10,
            eventDate: '2026-05-20T10:00:00Z',
        });

        expect(result.slug).toBe('tech-conf-2025');
        expect(result.status).toBe('DRAFT');
        expect(result.totalCapacity).toBe(10);
        expect(result.title).toBe('Tech Conf 2025');
    });

    it('should reject duplicate slug with validation error', async () => {
        await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        });

        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 10,
            })
        ).rejects.toThrow('Event with this slug already exists');
    });

    it('should reject invalid capacity', async () => {
        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 0,
            })
        ).rejects.toThrow();
    });

    it('should propagate database errors', async () => {
        await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        });

        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 10,
            })
        ).rejects.toThrow();
    });

    it('should preserve special characters in title', async () => {
        const result = await createDraftEvent({
            title: 'Tech & AI: 2025!',
            totalCapacity: 10,
        });

        expect(result.title).toBe('Tech & AI: 2025!');
        expect(result.slug).toBe('tech-and-ai-2025');
    });
});

describe('updateEvent', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should update totalCapacity for DRAFT event', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        // Wait a bit to ensure updatedAt will be different
        await new Promise(resolve => setTimeout(resolve, 10));

        const result = await updateEvent(event.id, {totalCapacity: 30});

        expect(result.totalCapacity).toBe(30);
        expect(result.status).toBe('DRAFT');
        expect(result.updatedAt.getTime()).toBeGreaterThan(event.updatedAt.getTime());
    });

    it('should update multiple fields simultaneously', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        const result = await updateEvent(event.id, {
            title: 'New Tech Conf',
            totalCapacity: 50,
            description: 'Updated description',
        });

        expect(result.title).toBe('New Tech Conf');
        expect(result.slug).toBe('new-tech-conf');
        expect(result.totalCapacity).toBe(50);
        expect(result.description).toBe('Updated description');
    });


    it('should do partial update with only totalCapacity', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: 'Original description',
        }).returning();

        const result = await updateEvent(event.id, {totalCapacity: 30});

        expect(result.title).toBe('Tech Conf 2025');
        expect(result.description).toBe('Original description');
        expect(result.totalCapacity).toBe(30);
    });

    it('should reject totalCapacity <= 0', async () => {
        await expect(
            updateEvent(1, {totalCapacity: 0})
        ).rejects.toThrow();
    });

    it('should reject non-integer capacity', async () => {
        await expect(
            updateEvent(1, {totalCapacity: 30.5})
        ).rejects.toThrow();
    });

    it('should throw error when event not found', async () => {
        await expect(
            updateEvent(999, {totalCapacity: 30})
        ).rejects.toThrow('Event not found');
    });

    it('should reject decreasing capacity for PUBLISHED event', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 30,
        }).returning();

        await expect(
            updateEvent(event.id, {totalCapacity: 20})
        ).rejects.toThrow('Cannot decrease capacity for published event');
    });

    it('should allow increasing capacity for PUBLISHED event', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 30,
        }).returning();

        const result = await updateEvent(event.id, {totalCapacity: 50});

        expect(result.totalCapacity).toBe(50);
        expect(result.status).toBe('PUBLISHED');
    });

    it('should reject new capacity less than allocated tickets for DRAFT event', async () => {
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
            updateEvent(event.id, {totalCapacity: 5})
        ).rejects.toThrow();
    });

    it('should reject update if title generates a duplicate slug', async () => {
        // Create Event A
        await db.insert(events).values({
            title: 'Event A',
            slug: 'event-a',
            status: 'DRAFT',
            totalCapacity: 10,
        });

        // Create Event B
        const [eventB] = await db.insert(events).values({
            title: 'Event B',
            slug: 'event-b',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        // Try to rename Event B to "Event A" (which generates slug 'event-a')
        await expect(
            updateEvent(eventB.id, { title: 'Event A' })
        ).rejects.toThrow('Event with this slug already exists');
    });

    it('should update eventDate', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            eventDate: new Date('2025-01-01T10:00:00Z'),
        }).returning();

        // Update to a new date
        const newDate = '2026-12-31T23:59:59Z';
        const result = await updateEvent(event.id, { eventDate: newDate });
        expect(result.eventDate?.toISOString()).toBe(new Date(newDate).toISOString());
    });
});

describe('publishEvent', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should publish a DRAFT event with enabled ticket types', async () => {
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
            allocation: 10,
            enabled: true,
        });

        const result = await publishEvent(event.id);

        expect(result.status).toBe('PUBLISHED');
        expect(result.id).toBe(event.id);
    });
});
