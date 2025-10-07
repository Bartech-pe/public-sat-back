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
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Reminders.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for reminders.
 */
@Controller('reminders')
export class ReminderController {
  constructor(private readonly service: ReminderService) {}

  /**
   * Retrieves a paginated list of reminders.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing reminders
   */
  @ApiBearerAuth()
  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Reminder>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  /**
   * Retrieves a single channel by its ID.
   * @param id Reminder identifier
   * @returns Reminder entity
   */
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Reminder> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new channel.
   * @param dto Data Transfer Object containing channel data
   * @returns The created Reminder entity
   */
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateReminderDto): Promise<Reminder> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing channel by its ID.
   * @param id Reminder identifier
   * @param dto Data to update
   * @returns Updated Reminder entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateReminderDto,
  ): Promise<Reminder> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a channel.
   * @param id Reminder identifier
   * @returns Reminder entity with updated status
   */
  @ApiBearerAuth()
  @Put('toggleStatus/:id')
  toggleReminder(@Param('id') id: number): Promise<Reminder> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a channel by its ID.
   * @param id Reminder identifier
   * @returns void
   */
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
