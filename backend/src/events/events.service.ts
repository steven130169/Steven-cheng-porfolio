import { Injectable, NotFoundException } from '@nestjs/common';

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

@Injectable()
export class EventsService {
  private events: Event[] = [
    { id: '1', title: 'DevOps Days', date: '2023-09-01', description: 'A tech conference' },
    { id: '2', title: 'Tech Meetup', date: '2023-10-15', description: 'Monthly gathering' },
  ];

  findAll(): Event[] {
    return this.events;
  }

  findOne(id: string): Event {
    const event = this.events.find(e => e.id === id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}