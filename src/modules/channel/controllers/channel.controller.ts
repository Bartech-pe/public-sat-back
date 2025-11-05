import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChannelService } from '../services/channel.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { Channel } from '../entities/channel.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing Channels.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for channels.
 */
@ApiBearerAuth()
@Controller('channels')
export class ChannelController {
  constructor(private readonly service: ChannelService) {}

  /**
   * Retrieves a paginated list of channels.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing channels
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Channel>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single channel by its ID.
   * @param id Channel identifier
   * @returns Channel entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Channel> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new channel.
   * @param dto Data Transfer Object containing channel data
   * @returns The created Channel entity
   */
  @Post()
  create(@Body() dto: CreateChannelDto): Promise<Channel> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing channel by its ID.
   * @param id Channel identifier
   * @param dto Data to update
   * @returns Updated Channel entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a channel.
   * @param id Channel identifier
   * @returns Channel entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Channel> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a channel by its ID.
   * @param id Channel identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
