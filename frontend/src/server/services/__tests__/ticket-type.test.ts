/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createTicketType} from '../ticket-type';

// Mock the database module
vi.mock('@/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
    },
}));

// Import db after mocking
import {db} from '@/server/db';

describe('createTicketType', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create ticket type with allocation', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Mock SELECT for event lookup
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Mock SELECT for existing ticket types (no existing allocations)
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]), // No existing ticket types
            }),
        };

        // Mock INSERT for creating ticket type
        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        eventId: 1,
                        name: 'Early Bird',
                        price: 100,
                        allocation: 10,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any) // Event lookup
            .mockReturnValueOnce(mockTicketTypesSelectChain as any); // Ticket types lookup
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createTicketType({
            eventId: 1,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: true,
        });

        expect(result.name).toBe('Early Bird');
        expect(result.price).toBe(100);
        expect(result.allocation).toBe(10);
        expect(result.enabled).toBe(true);
        expect(result.eventId).toBe(1);
    });

    it('should create ticket type without allocation (null)', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 2,
                        eventId: 1,
                        name: 'General',
                        price: 150,
                        allocation: null,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createTicketType({
            eventId: 1,
            name: 'General',
            price: 150,
            allocation: null,
            enabled: true,
        });

        expect(result.name).toBe('General');
        expect(result.allocation).toBeNull();
        expect(result.enabled).toBe(true);
    });

    it('should reject when allocation exceeds remaining capacity', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Existing ticket type with allocation 8
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        eventId: 1,
                        name: 'Early Bird',
                        price: 100,
                        allocation: 8,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);

        // Try to add allocation 5 (total would be 13 > capacity 10)
        await expect(
            createTicketType({
                eventId: 1,
                name: 'VIP',
                price: 300,
                allocation: 5,
                enabled: true,
            })
        ).rejects.toThrow('Allocations exceed total capacity');
    });

    it('should allow when allocation fits within remaining capacity', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Existing ticket type with allocation 5
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        eventId: 1,
                        name: 'Early Bird',
                        price: 100,
                        allocation: 5,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 2,
                        eventId: 1,
                        name: 'General',
                        price: 150,
                        allocation: 5,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createTicketType({
            eventId: 1,
            name: 'General',
            price: 150,
            allocation: 5,
            enabled: true,
        });

        expect(result.allocation).toBe(5);
        expect(result.eventId).toBe(1);
    });

    it('should allow mixed allocations (some null, some defined)', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Existing ticket type with allocation 8, plus one with null
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        eventId: 1,
                        name: 'Early Bird',
                        price: 100,
                        allocation: 8,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 3,
                        eventId: 1,
                        name: 'General',
                        price: 150,
                        allocation: null,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createTicketType({
            eventId: 1,
            name: 'General',
            price: 150,
            allocation: null,
            enabled: true,
        });

        expect(result.allocation).toBeNull();
        expect(result.enabled).toBe(true);
    });

    it('should reject when event not found', async () => {
        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]), // No event found
                }),
            }),
        };

        vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

        await expect(
            createTicketType({
                eventId: 999,
                name: 'VIP',
                price: 300,
                allocation: 10,
                enabled: true,
            })
        ).rejects.toThrow('Event not found');
    });

    it('should allow creating ticket type for PUBLISHED event', async () => {
        const mockEvent = {
            id: 1,
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED', // Event is published
            totalCapacity: 10,
            description: null,
            eventDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockEvent]),
                }),
            }),
        };

        // Existing ticket type with allocation 5
        const mockTicketTypesSelectChain = {
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([
                    {
                        id: 1,
                        eventId: 1,
                        name: 'Early Bird',
                        price: 100,
                        allocation: 5,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        const mockInsertChain = {
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                    {
                        id: 2,
                        eventId: 1,
                        name: 'General',
                        price: 150,
                        allocation: 5,
                        enabled: true,
                        createdAt: new Date(),
                    },
                ]),
            }),
        };

        vi.mocked(db.select)
            .mockReturnValueOnce(mockSelectChain as any)
            .mockReturnValueOnce(mockTicketTypesSelectChain as any);
        vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

        const result = await createTicketType({
            eventId: 1,
            name: 'General',
            price: 150,
            allocation: 5,
            enabled: true,
        });

        expect(result.allocation).toBe(5);
        expect(result.eventId).toBe(1);
    });
});
