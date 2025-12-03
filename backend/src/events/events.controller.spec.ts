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
                date: '2023-09-01',
                description: 'A tech conference',
              },
              {
                id: '2',
                title: 'Tech Meetup',
                date: '2023-10-15',
                description: 'Monthly gathering',
              },
            ]),
            findOne: jest.fn().mockImplementation((id) => {
              if (id === '1') {
                return {
                  id: '1',
                  title: 'DevOps Days',
                  date: '2023-09-01',
                  description: 'A tech conference',
                };
              }
              throw new NotFoundException('Event not found');
            }),
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
