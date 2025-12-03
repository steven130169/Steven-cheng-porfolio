import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

  @Delete('/test/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetEventsForTest() {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'e2e') {
      this.eventsService.resetEvents();
    }
  }
}
