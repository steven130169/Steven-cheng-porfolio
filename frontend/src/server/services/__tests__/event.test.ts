/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createDraftEvent, updateEvent} from '../event';

// Mock the database module
vi.mock('@/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
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

describe('updateEvent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update totalCapacity for DRAFT event', async () => {
        const previousUpdatedAt = new Date('2025-01-01T00:00:00Z');
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: previousUpdatedAt,
        };

        // Mock SELECT - first call returns event, second call returns ticket types
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Mock for ticketTypes query (no allocated tickets)
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]), // No ticket types with allocations
            }),
        };

        // Mock UPDATE to return updated event
        const mockUpdateChain = {
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([
                        {
                            ...mockEvent,
                            totalCapacity: 30,
                            updatedAt: new Date(),
                        },
                    ]),
                }),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

        const result = await updateEvent(1, {totalCapacity: 30});

        expect(result.totalCapacity).toBe(30);
        expect(result.status).toBe('DRAFT');
        expect(result.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
    });

    it('should update multiple fields simultaneously', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };

        // Mock SELECT for event
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Mock for ticketTypes query
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        };

        // Mock for slug uniqueness check
        const mockSlugCheckChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // Slug is unique
                }),
            }),
        };

        const mockUpdateChain = {
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([
                        {
                            ...mockEvent,
                            title: 'New Tech Conf',
                            slug: 'new-tech-conf',
                            totalCapacity: 50,
                            description: 'Updated description',
                            updatedAt: new Date(),
                        },
                    ]),
                }),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any) // Get event
            .mockReturnValueOnce(mockTicketTypesSelectChain as any) // Check allocations
            .mockReturnValueOnce(mockSlugCheckChain as any); // Check slug uniqueness
        vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

        const result = await updateEvent(1, {
            title: 'New Tech Conf',
            totalCapacity: 50,
            description: 'Updated description',
        });

        expect(result.title).toBe('New Tech Conf');
        expect(result.slug).toBe('new-tech-conf');
        expect(result.totalCapacity).toBe(50);
        expect(result.description).toBe('Updated description');
    });

    it('should do partial update with only totalCapacity', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: 'Original description',
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };

        // Mock SELECT for event
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Mock for ticketTypes query
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        };

        const mockUpdateChain = {
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([
                        {
                            ...mockEvent,
                            totalCapacity: 30,
                            updatedAt: new Date(),
                        },
                    ]),
                }),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

        const result = await updateEvent(1, {totalCapacity: 30});

        expect(result.title).toBe('Tech Conf 2025');
        expect(result.description).toBe('Original description');
        expect(result.totalCapacity).toBe(30);
    });

    it('should reject totalCapacity <= 0', async () => {
        await expect(
            updateEvent(1, {totalCapacity: 0})
        ).rejects.toThrow();
    });

    it('should reject non-integer capacity', async () => {
        await expect(
            updateEvent(1, {totalCapacity: 30.5})
        ).rejects.toThrow();
    });

    it('should throw error when event not found', async () => {
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No event found
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        await expect(
            updateEvent(999, {totalCapacity: 30})
        ).rejects.toThrow('Event not found');
    });

    it('should reject decreasing capacity for PUBLISHED event', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 30,
            description: null,
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        await expect(
            updateEvent(1, {totalCapacity: 20})
        ).rejects.toThrow('Cannot decrease capacity for published event');
    });

    it('should allow increasing capacity for PUBLISHED event', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 30,
            description: null,
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        const mockUpdateChain = {
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([
                        {
                            ...mockEvent,
                            totalCapacity: 50,
                            updatedAt: new Date(),
                        },
                    ]),
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
        vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

        const result = await updateEvent(1, {totalCapacity: 50});

        expect(result.totalCapacity).toBe(50);
        expect(result.status).toBe('PUBLISHED');
    });

    it('should reject new capacity less than allocated tickets for DRAFT event', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        // This test will need ticket types mock - will be implemented in Green phase
        await expect(
            updateEvent(1, {totalCapacity: 5})
        ).rejects.toThrow();
    });
});
