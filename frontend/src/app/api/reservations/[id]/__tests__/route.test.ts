import {describe, it, expect, beforeEach, vi} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('@/server/db/__tests__/test-db');
    return createTestDb();
});

import {GET} from '../route';
import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {NextRequest} from 'next/server';
import {sql} from 'drizzle-orm';

describe('GET /api/reservations/[id]', () => {
    let testEventId: number;
    let testTicketTypeId: number;
    let testReservationId: number;

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

        const [reservation] = await db.insert(reservations).values({
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 2,
            customerEmail: 'test@example.com',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }).returning();
        testReservationId = reservation.id;
    });

    it('should return reservation by id', async () => {
        const request = new NextRequest(
            `http://localhost:3000/api/reservations/${testReservationId}`,
            {method: 'GET'}
        );

        const response = await GET(request, {params: Promise.resolve({id: testReservationId.toString()})});
        const data = await response.json() as {
            id: number;
            quantity: number;
            status: string;
            customerEmail: string;
        };

        expect(response.status).toBe(200);
        expect(data.id).toBe(testReservationId);
        expect(data.quantity).toBe(2);
        expect(data.status).toBe('ACTIVE');
        expect(data.customerEmail).toBe('test@example.com');
    });

    it('should return 404 when reservation not found', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/reservations/99999',
            {method: 'GET'}
        );

        const response = await GET(request, {params: Promise.resolve({id: '99999'})});
        const data = await response.json() as {error: string};

        expect(response.status).toBe(404);
        expect(data.error).toContain('not found');
    });

    it('should return 400 when id is invalid', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/reservations/invalid',
            {method: 'GET'}
        );

        const response = await GET(request, {params: Promise.resolve({id: 'invalid'})});
        const data = await response.json() as {error: string};

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
    });
});
