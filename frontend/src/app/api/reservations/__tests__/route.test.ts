import {describe, it, expect, beforeEach, vi} from 'vitest';
import {NextRequest} from 'next/server';

// Mock Payload
const mockPayload = {
    findByID: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
};

vi.mock('payload', () => ({
    getPayload: vi.fn(() => Promise.resolve(mockPayload)),
    buildConfig: vi.fn((config) => config),
}));

import {POST} from '../route';

describe('POST /api/reservations', () => {
    const mockEvent = {
        id: 'test-event-id',
        title: 'Test Event',
        slug: 'test-event',
        status: 'PUBLISHED',
        totalCapacity: 10,
        ticketTypes: [
            {
                name: 'Early Bird',
                price: 100,
                allocation: 10,
                enabled: true,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create reservation and return 201', async () => {
        mockPayload.findByID.mockResolvedValue(mockEvent);
        mockPayload.find.mockResolvedValue({docs: []}); // No existing reservations
        mockPayload.create.mockResolvedValue({
            id: 'new-reservation-id',
            event: 'test-event-id',
            ticketTypeName: 'Early Bird',
            quantity: 2,
            customerEmail: 'test@example.com',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });

        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: 'test-event-id',
                ticketTypeName: 'Early Bird',
                quantity: 2,
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.id).toBe('new-reservation-id');
        expect(data.quantity).toBe(2);
        expect(data.status).toBe('ACTIVE');

        expect(mockPayload.create).toHaveBeenCalledWith({
            collection: 'reservations',
            data: expect.objectContaining({
                event: 'test-event-id',
                ticketTypeName: 'Early Bird',
                quantity: 2,
                customerEmail: 'test@example.com',
                status: 'ACTIVE',
            }),
        });
    });

    it('should return 400 when insufficient inventory', async () => {
        mockPayload.findByID.mockResolvedValue(mockEvent);
        // Mock existing reservations that use all 10 tickets
        mockPayload.find.mockResolvedValue({
            docs: [
                {
                    event: 'test-event-id',
                    ticketTypeName: 'Early Bird',
                    quantity: 10,
                    status: 'ACTIVE',
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                },
            ],
        });

        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: 'test-event-id',
                ticketTypeName: 'Early Bird',
                quantity: 1,
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json() as { error: string };

        expect(response.status).toBe(400);
        expect(data.error).toContain('Insufficient Inventory');
    });

    it('should return 400 when validation fails', async () => {
        const request = new NextRequest('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: 'test-event-id',
                ticketTypeName: 'Early Bird',
                quantity: 0, // Invalid: must be >= 1
                customerEmail: 'test@example.com',
            }),
        });

        const response = await POST(request);
        const data = await response.json() as { error: string };

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
    });
});
