import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EventsService, Event } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  create(@Body() event: Omit<Event, 'id'>) {
    return this.eventsService.create(event);
  }
}