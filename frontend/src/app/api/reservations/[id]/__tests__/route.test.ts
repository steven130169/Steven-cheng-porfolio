import {describe, it, expect, beforeEach, vi} from 'vitest';
import {NextRequest} from 'next/server';

// Mock Payload
const mockPayload = {
    findByID: vi.fn(),
};

vi.mock('payload', () => ({
    getPayload: vi.fn(() => Promise.resolve(mockPayload)),
    buildConfig: vi.fn((config) => config),
}));

import {GET} from '../route';

describe('GET /api/reservations/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return reservation by id', async () => {
        const mockReservation = {
            id: 'test-reservation-id',
            event: 'test-event-id',
            ticketTypeName: 'Early Bird',
            quantity: 2,
            customerEmail: 'test@example.com',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockPayload.findByID.mockResolvedValue(mockReservation);

        const request = new NextRequest(
            'http://localhost:3000/api/reservations/test-reservation-id',
            {method: 'GET'}
        );

        const response = await GET(request, {
            params: Promise.resolve({id: 'test-reservation-id'})
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.id).toBe('test-reservation-id');
        expect(data.quantity).toBe(2);
        expect(data.status).toBe('ACTIVE');
        expect(data.customerEmail).toBe('test@example.com');

        expect(mockPayload.findByID).toHaveBeenCalledWith({
            collection: 'reservations',
            id: 'test-reservation-id',
        });
    });

    it('should return 404 when reservation not found', async () => {
        mockPayload.findByID.mockResolvedValue(null);

        const request = new NextRequest(
            'http://localhost:3000/api/reservations/non-existent-id',
            {method: 'GET'}
        );

        const response = await GET(request, {
            params: Promise.resolve({id: 'non-existent-id'})
        });
        const data = await response.json() as { error: string };

        expect(response.status).toBe(404);
        expect(data.error).toContain('not found');
    });

    it('should handle errors gracefully', async () => {
        mockPayload.findByID.mockRejectedValue(new Error('Database error'));

        const request = new NextRequest(
            'http://localhost:3000/api/reservations/test-id',
            {method: 'GET'}
        );

        const response = await GET(request, {
            params: Promise.resolve({id: 'test-id'})
        });
        const data = await response.json() as { error: string };

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
    });
});
