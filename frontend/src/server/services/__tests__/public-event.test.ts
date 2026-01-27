import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/server/db', async () => {
    const { createTestDb } = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import { db } from '@/server/db';
import { events } from '@/server/db/schema';
import { sql } from 'drizzle-orm';
import { getPublishedEvents } from '../public-event';

describe('getPublishedEvents', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should return only published events', async () => {
        await db.insert(events).values({
            title: 'Published Event',
            slug: 'published-event',
            status: 'PUBLISHED',
            totalCapacity: 100,
        });
        await db.insert(events).values({
            title: 'Draft Event',
            slug: 'draft-event',
            status: 'DRAFT',
            totalCapacity: 50,
        });

        const result = await getPublishedEvents();

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Published Event');
        expect(result[0].status).toBe('PUBLISHED');
    });

    it('should return empty array when no published events exist', async () => {
        await db.insert(events).values({
            title: 'Draft Event',
            slug: 'draft-event',
            status: 'DRAFT',
            totalCapacity: 50,
        });

        const result = await getPublishedEvents();

        expect(result).toHaveLength(0);
    });
});
