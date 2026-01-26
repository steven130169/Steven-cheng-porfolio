/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {getPublishedEvents} from '../public-event';

vi.mock('@/server/db', () => ({
    db: {
        select: vi.fn(),
    },
}));

import {db} from '@/server/db';

describe('getPublishedEvents', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return only published events', async () => {
        const mockPublishedEvent = {
            id: 1,
            title: 'Published Event',
            slug: 'published-event',
            status: 'PUBLISHED',
            totalCapacity: 100,
            description: 'A published event',
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([mockPublishedEvent]),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        const result = await getPublishedEvents();

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Published Event');
        expect(result[0].status).toBe('PUBLISHED');
    });

    it('should return empty array when no published events exist', async () => {
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        const result = await getPublishedEvents();

        expect(result).toHaveLength(0);
    });
});
