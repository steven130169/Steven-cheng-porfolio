import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findAll: jest.fn().mockReturnValue([
              {
                id: '1',
                title: 'DevOps Days',
                role: 'Org',
                date: '2023-09-01',
                description: 'A tech conference',
                tags: [],
                status: 'Past',
              },
              {
                id: '2',
                title: 'Tech Meetup',
                role: 'Speaker',
                date: '2023-10-15',
                description: 'Monthly gathering',
                tags: [],
                status: 'Past',
              },
            ]),
            findOne: jest.fn().mockImplementation((id) => {
              if (id === '1') {
                return {
                  id: '1',
                  title: 'DevOps Days',
                  role: 'Org',
                  date: '2023-09-01',
                  description: 'A tech conference',
                  tags: [],
                  status: 'Past',
                };
              }
              throw new NotFoundException('Event not found');
            }),
            create: jest.fn().mockImplementation((dto: unknown) => ({
              id: '3',
              ...(dto as object),
            })),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of events', () => {
      const result = controller.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('DevOps Days');
    });
  });

  describe('create', () => {
    it('should create an event', () => {
      const dto = {
        title: 'New',
        role: 'Host',
        date: '2024',
        description: 'Desc',
        tags: [],
        status: 'Upcoming',
      };
      const result = controller.create(dto);
      expect(result.id).toBe('3');
      expect(result.title).toBe('New');
    });
  });

  describe('findOne', () => {
    it('should return a single event', () => {
      const result = controller.findOne('1');
      expect(result.title).toBe('DevOps Days');
    });

    it('should throw NotFoundException if event not found', () => {
      expect(() => controller.findOne('999')).toThrow(NotFoundException);
    });
  });
});
