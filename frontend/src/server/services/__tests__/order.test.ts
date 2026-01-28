import {describe, it, expect, beforeEach, vi} from 'vitest';

vi.mock('@/server/db', async () => {
    const {createTestDb} = await import('@/server/db/__tests__/test-db');
    return createTestDb();
});

import {createOrderFromReservation} from '../order';
import {db} from '@/server/db';
import {events, ticketTypes, reservations} from '@/server/db/schema';
import {sql} from 'drizzle-orm';

describe('createOrderFromReservation', () => {
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

        // Create active reservation
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

    it('should create order from valid reservation', async () => {
        const order = await createOrderFromReservation(testReservationId);

        expect(order.id).toBeDefined();
        expect(order.customerEmail).toBe('test@example.com');
        expect(order.totalAmount).toBe(200); // 2 tickets × 100
        expect(order.status).toBe('pending');
    });

    it('should mark reservation as CONSUMED after order creation', async () => {
        await createOrderFromReservation(testReservationId);

        const [reservation] = await db
            .select()
            .from(reservations)
            .where(sql`${reservations.id} = ${testReservationId}`)
            .limit(1);

        expect(reservation.status).toBe('CONSUMED');
    });

    it('should reject when reservation not found', async () => {
        await expect(createOrderFromReservation(99_999)).rejects.toThrow('Reservation not found');
    });

    it('should reject when reservation is already consumed', async () => {
        // Consume the reservation first
        await db
            .update(reservations)
            .set({status: 'CONSUMED'})
            .where(sql`${reservations.id} = ${testReservationId}`);

        await expect(createOrderFromReservation(testReservationId)).rejects.toThrow(
            'Reservation already consumed or expired'
        );
    });

    it('should reject when reservation is expired', async () => {
        // Expire the reservation
        await db
            .update(reservations)
            .set({
                status: 'EXPIRED',
                expiresAt: new Date(Date.now() - 1000),
            })
            .where(sql`${reservations.id} = ${testReservationId}`);

        await expect(createOrderFromReservation(testReservationId)).rejects.toThrow(
            'Reservation already consumed or expired'
        );
    });

    it('should reject when reservation time has passed', async () => {
        // Set expiry to the past but status still ACTIVE
        await db
            .update(reservations)
            .set({expiresAt: new Date(Date.now() - 1000)})
            .where(sql`${reservations.id} = ${testReservationId}`);

        await expect(createOrderFromReservation(testReservationId)).rejects.toThrow('Reservation has expired');
    });
});
