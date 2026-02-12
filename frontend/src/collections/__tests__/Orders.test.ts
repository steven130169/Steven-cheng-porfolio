/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import {describe, it, expect} from 'vitest';
import {Orders} from '../Orders';

describe('Orders Collection', () => {
    it('should have correct slug', () => {
        expect(Orders.slug).toBe('orders');
    });

    it('should have customer and payment fields', () => {
        const fieldNames = Orders.fields.map((f: any) => f.name);
        expect(fieldNames).toContain('customerEmail');
        expect(fieldNames).toContain('status');
        expect(fieldNames).toContain('totalAmount');
    });

    it('should have items array with event relationship', () => {
        const itemsField = Orders.fields.find((f: any) => f.name === 'items');
        expect(itemsField?.type).toBe('array');

        const eventField = itemsField?.fields?.find((f: any) => f.name === 'event');
        expect(eventField?.type).toBe('relationship');
        expect(eventField?.relationTo).toBe('events');
    });

    it('should auto-calculate total amount', () => {
        const hook = Orders.hooks?.beforeChange?.[0];
        expect(hook).toBeDefined();

        const data = {
            customerEmail: 'test@example.com',
            items: [
                {event: '123', ticketTypeName: 'Early Bird', quantity: 2, price: 500},
                {event: '123', ticketTypeName: 'Regular', quantity: 1, price: 800},
            ],
            status: 'pending',
        };

        const result = hook?.({
            data,
            operation: 'create',
            req: {} as any,
        } as any);

        expect(result.totalAmount).toBe(1800); // (2 * 500) + (1 * 800)
    });
});
