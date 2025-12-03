import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of events', () => {
      const result = service.findAll();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('create', () => {
    it('should create and return a new event', () => {
      const newEvent = {
        title: 'New Event',
        role: 'Host',
        date: '2024-01-01',
        description: 'Description',
        tags: ['New'],
        status: 'Upcoming'
      };
      const result = service.create(newEvent);
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(newEvent.title);
      expect(service.findAll()).toContainEqual(result);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if event not found', () => {
      expect(() => service.findOne('999')).toThrow(NotFoundException);
    });
  });
});
