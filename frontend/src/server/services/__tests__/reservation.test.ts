import {describe, it, expect, beforeEach, vi} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import {createReservation} from '../reservation';
import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {sql} from 'drizzle-orm';

describe('createReservation', () => {
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

    it('should create reservation with 15-minute expiry', async () => {
        const input = {
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 2,
            customerEmail: 'test@example.com',
        };

        const reservation = await createReservation(input);

        expect(reservation.id).toBeDefined();
        expect(reservation.quantity).toBe(2);
        expect(reservation.status).toBe('ACTIVE');
        expect(reservation.customerEmail).toBe('test@example.com');

        // Verify 15-minute expiry
        const now = new Date();
        const expectedExpiry = new Date(now.getTime() + 15 * 60 * 1000);
        const diff = Math.abs(reservation.expiresAt.getTime() - expectedExpiry.getTime());
        expect(diff).toBeLessThan(1000); // Within 1-second tolerance
    });

    it('should reject reservation when insufficient inventory', async () => {
        // Create 9 existing reservations (only 1 left)
        for (let i = 0; i < 9; i++) {
            await db.insert(reservations).values({
                eventId: testEventId,
                ticketTypeId: testTicketTypeId,
                quantity: 1,
                customerEmail: `user${i}@example.com`,
                status: 'ACTIVE',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            });
        }

        const input = {
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 2,
            customerEmail: 'test@example.com',
        };

        await expect(createReservation(input)).rejects.toThrow('Insufficient Inventory');
    });

    it('should prevent concurrent reservations from overselling (race condition)', async () => {
        // Only 1 ticket available
        await db.insert(reservations).values({
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 9,
            customerEmail: 'existing@example.com',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        const input1 = {
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 1,
            customerEmail: 'userA@example.com',
        };

        const input2 = {
            eventId: testEventId,
            ticketTypeId: testTicketTypeId,
            quantity: 1,
            customerEmail: 'userB@example.com',
        };

        // Simulate concurrent requests
        const results = await Promise.allSettled([
            createReservation(input1),
            createReservation(input2),
        ]);

        const successes = results.filter(r => r.status === 'fulfilled');
        const failures = results.filter(r => r.status === 'rejected');

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(1);

        if (failures[0].status === 'rejected') {
            expect((failures[0].reason as Error).message).toContain('Insufficient Inventory');
        }
    });
});
