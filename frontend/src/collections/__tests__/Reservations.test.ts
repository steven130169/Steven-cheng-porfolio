/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import {describe, expect, it} from 'vitest';
import {Reservations} from '..';

describe('Reservations Collection', () => {
    it('should have correct slug', () => {
        expect(Reservations.slug).toBe('reservations');
    });

    it('should have event relationship field', () => {
        const eventField = Reservations.fields.find((f: any) => f.name === 'event') as any;
        expect(eventField).toBeDefined();
        expect(eventField?.type).toBe('relationship');
        expect(eventField?.relationTo).toBe('events');
    });

    it('should have status field with correct options', () => {
        const statusField = Reservations.fields.find((f: any) => f.name === 'status') as any;
        expect(statusField?.type).toBe('select');
        expect(statusField?.options).toContainEqual({label: 'Active', value: 'ACTIVE'});
        expect(statusField?.options).toContainEqual({label: 'Consumed', value: 'CONSUMED'});
        expect(statusField?.options).toContainEqual({label: 'Expired', value: 'EXPIRED'});
    });

    it('should auto-set expiry time on creation', () => {
        const hook = Reservations.hooks?.beforeChange?.[0];
        expect(hook).toBeDefined();

        const data = {
            event: '123',
            ticketTypeName: 'Regular',
            quantity: 2,
            customerEmail: 'test@example.com',
            status: 'ACTIVE',
        };

        const result = hook?.({
            data,
            operation: 'create',
            req: {} as any,
        } as any);

        expect(result.expiresAt).toBeDefined();
        const expiryTime = new Date(result.expiresAt).getTime();
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        expect(expiryTime).toBeGreaterThan(now);
        expect(expiryTime).toBeLessThanOrEqual(now + fifteenMinutes + 1000);
    });
});
