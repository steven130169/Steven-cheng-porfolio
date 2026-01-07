/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createDraftEvent} from '../event';

// Mock the database module
vi.mock('@/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
    },
}));

// Import db after mocking
import {db} from '@/server/db';

describe('createDraftEvent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create draft event with generated slug', async () => {
        // Setup mocks
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No existing slug
                }),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        title: 'Tech Conf 2025',
                        slug: 'tech-conf-2025',
                        status: 'DRAFT',
                        totalCapacity: 10,
                        description: null,
                        eventDate: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createDraftEvent({
            title: 'Tech Conf 2025',
            totalCapacity: 10,
        });

        expect(result.slug).toBe('tech-conf-2025');
        expect(result.status).toBe('DRAFT');
        expect(result.totalCapacity).toBe(10);
        expect(result.title).toBe('Tech Conf 2025');
    });

    it('should reject duplicate slug with validation error', async () => {
        // Setup mocks - slug already exists
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{id: 1}]), // Existing event found
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 10,
            })
        ).rejects.toThrow('Event with this title already exists');
    });

    it('should reject invalid capacity', async () => {
        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 0,
            })
        ).rejects.toThrow();
    });

    it('should propagate database errors', async () => {
        // Setup mocks
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No existing slug
                }),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockRejectedValue(new Error('Database connection failed')),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        await expect(
            createDraftEvent({
                title: 'Tech Conf 2025',
                totalCapacity: 10,
            })
        ).rejects.toThrow('Database connection failed');
    });

    it('should preserve special characters in title', async () => {
        // Setup mocks
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No existing slug
                }),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        title: 'Tech & AI: 2025!',
                        slug: 'tech-ai-2025',
                        status: 'DRAFT',
                        totalCapacity: 10,
                        description: null,
                        eventDate: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createDraftEvent({
            title: 'Tech & AI: 2025!',
            totalCapacity: 10,
        });

        expect(result.title).toBe('Tech & AI: 2025!');
        expect(result.slug).toBe('tech-ai-2025');
    });
});
