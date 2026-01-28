import {describe, it, expect, beforeEach, vi} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('@/server/db/__tests__/test-db');
    return createTestDb();
});

import {POST} from '../route';
import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {NextRequest} from 'next/server';
import {sql} from 'drizzle-orm';

describe('POST /api/reservations', () => {
    let testEventId: number;
    let testTicketTypeId: number;

    beforeEach(async () => {
        // Cleanup
        await db.execute(sql`TRUNCATE events, ticket_types, orders, reservations CASCADE`);

        // Seed test data
        const [event] = await db.insert(events).values({
            title: 'Test Event',
            slug: 'test-event',
            status: 'PUBLISHED',
            totalCapacity: 10,
        }).returning();
        testEventId = event.id;

        const [ticketType] = await db.insert(ticketTypes).values({
            eventId: testEventId,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: true,
        }).returning();
        testTicketTypeId = ticketType.id;
    });

    it('should create reservation and return 201', async () => {
        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: testEventId,
                ticketTypeId: testTicketTypeId,
                quantity: 2,
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json() as {
            id: number;
            quantity: number;
            status: string;
        };

        expect(response.status).toBe(201);
        expect(data.id).toBeDefined();
        expect(data.quantity).toBe(2);
        expect(data.status).toBe('ACTIVE');
    });

    it('should return 400 when insufficient inventory', async () => {
        // Use all 10 tickets
        await db.insert(reservations).values({
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 10,
            customerEmail: 'existing@example.com',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: testEventId,
                ticketTypeId: testTicketTypeId,
                quantity: 1,
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json() as {error: string};

        expect(response.status).toBe(400);
        expect(data.error).toContain('Insufficient Inventory');
    });

    it('should return 400 when validation fails', async () => {
        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: testEventId,
                ticketTypeId: testTicketTypeId,
                quantity: 0, // Invalid: must be >= 1
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json() as {error: string};

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
    });
});
