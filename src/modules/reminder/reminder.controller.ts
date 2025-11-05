import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';

import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Controller('reminder')
export class ReminderController {

  constructor(private readonly service: ReminderService) {}

  @Get()
    findAll(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResponse<Reminder>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Reminder> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateReminderDto): Promise<Reminder> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() dto: UpdateReminderDto,
    ): Promise<Reminder> {
      return this.service.update(+id, dto);
    }
  
    @Put('toggleReminder/:id')
    toggleReminder(@Param('id') id: number): Promise<Reminder> {
      return this.service.toggleReminder(id);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
