import { Injectable, NotFoundException } from '@nestjs/common';

export interface Event {
  id: string;
  title: string;
  role: string;
  date: string;
  description: string;
  tags: string[];
  status: string;
}

@Injectable()
export class EventsService {
  private events: Event[] = [
    {
      id: '1',
      title: 'DevOps Days',
      role: 'Organizer',
      date: '2023-09-01',
      description: 'A tech conference',
      tags: ['Conference'],
      status: 'Past'
    },
    {
      id: '2',
      title: 'Tech Meetup',
      role: 'Speaker',
      date: '2023-10-15',
      description: 'Monthly gathering',
      tags: ['Meetup'],
      status: 'Past'
    },
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

  create(event: Omit<Event, 'id'>): Event {
    const newEvent = {
      id: Date.now().toString(),
      ...event,
    };
    this.events.unshift(newEvent); // Add to top
    return newEvent;
  }
}