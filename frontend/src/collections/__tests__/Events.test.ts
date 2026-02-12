/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import {describe, it, expect} from 'vitest';
import {Events} from '../Events';

describe('Events Collection', () => {
    it('should have correct slug', () => {
        expect(Events.slug).toBe('events');
    });

    it('should have basic event fields', () => {
        const fieldNames = Events.fields.map((f: any) => f.name);
        expect(fieldNames).toContain('title');
        expect(fieldNames).toContain('slug');
        expect(fieldNames).toContain('description');
        expect(fieldNames).toContain('status');
        expect(fieldNames).toContain('eventDate');
        expect(fieldNames).toContain('totalCapacity');
    });

    it('should have ticketTypes array field', () => {
        const fieldNames = Events.fields.map((f: any) => f.name);
        expect(fieldNames).toContain('ticketTypes');

        const ticketTypesField = Events.fields.find((f: any) => f.name === 'ticketTypes');
        expect(ticketTypesField?.type).toBe('array');
    });

    it('should have beforeChange hook for validation', () => {
        expect(Events.hooks?.beforeChange).toBeDefined();
        expect(Array.isArray(Events.hooks?.beforeChange)).toBe(true);
    });

    it('should validate total allocation does not exceed capacity', () => {
        const hook = Events.hooks?.beforeChange?.[0];
        expect(hook).toBeDefined();

        // Test validation logic
        const invalidData = {
            totalCapacity: 100,
            ticketTypes: [
                {name: 'Early Bird', price: 500, allocation: 60},
                {name: 'Regular', price: 800, allocation: 50}, // Total 110 > 100
            ],
        };

        expect(() => {
            hook?.({data: invalidData, operation: 'create'} as any);
        }).toThrow(/票種總配額.*不能超過總容量/);
    });
});
