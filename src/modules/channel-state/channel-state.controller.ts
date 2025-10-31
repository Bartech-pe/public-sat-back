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
import { ChannelStateService } from './channel-state.service';
import { CreateChannelStateDto } from './dto/create-channel-state.dto';
import { UpdateChannelStateDto } from './dto/update-channel-state.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ChannelState } from './entities/channel-state.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { BaseResponseDto } from '@common/dto/base-response.dto';

/**
 * Controller for managing Channel status.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for channel status.
 */
@ApiBearerAuth()
@Controller('channel-states')
export class ChannelStateController {
  constructor(private readonly service: ChannelStateService) {}

  /**
   * Retrieves a paginated list of channel status.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing channel status
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChannelState>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a paginated list of channel status.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing channel status
   */
  @Put('channelStateEmail')
  findAllChannelStateEmail(@CurrentUser() user: User): Promise<ChannelState[]> {
    return this.service.findAllChannelStateEmail(user);
  }

  /**
   * Retrieves a paginated list of channel status.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing channel status
   */

  @Get(':channel/statuses')
  async getUserStatusesByChannel(@Param('channel') channel: string): Promise<BaseResponseDto<any>> {
    return this.service.getUserStatusesByChannel(channel);
  }


  /**
   * Retrieves a single channel by its ID.
   * @param id Channel Status identifier
   * @returns Channel Status entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<ChannelState> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new channel.
   * @param dto Data Transfer Object containing channel data
   * @returns The created Channel Status entity
   */
  @Post()
  create(@Body() dto: CreateChannelStateDto): Promise<ChannelState> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing channel by its ID.
   * @param id Channel Status identifier
   * @param dto Data to update
   * @returns Updated Channel Status entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateChannelStateDto,
  ): Promise<ChannelState> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a channel.
   * @param id Channel Status identifier
   * @returns Channel Status entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<ChannelState> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a channel by its ID.
   * @param id Channel Status identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
