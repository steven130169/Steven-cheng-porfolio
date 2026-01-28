import {describe, it, expect} from 'vitest';
import {reservations} from '@/server/db/schema';

describe('reservations schema', () => {
    it('should define reservations table with required columns', () => {
        expect(reservations).toBeDefined();
        expect(reservations).toBeTypeOf('object');
    });

    it('should have correct column structure', () => {
        expect(reservations.id).toBeDefined();
        expect(reservations.eventId).toBeDefined();
        expect(reservations.ticketTypeId).toBeDefined();
        expect(reservations.quantity).toBeDefined();
        expect(reservations.customerEmail).toBeDefined();
        expect(reservations.status).toBeDefined();
        expect(reservations.expiresAt).toBeDefined();
        expect(reservations.createdAt).toBeDefined();
    });
});
