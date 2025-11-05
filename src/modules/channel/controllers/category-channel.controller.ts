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
import { CategoryChannelService } from '../services/category-channel.service';
import { CreateCategoryChannelDto } from '../dto/create-category-channel.dto';
import { UpdateCategoryChannelDto } from '../dto/update-category-channel.dto';
import { CategoryChannel } from '../entities/category-channel.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing CategoryChannels.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for channels.
 */
@ApiBearerAuth()
@Controller('category-channels')
export class CategoryChannelController {
  constructor(private readonly service: CategoryChannelService) {}

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
  ): Promise<PaginatedResponse<CategoryChannel>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single channel by its ID.
   * @param id CategoryChannel identifier
   * @returns CategoryChannel entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<CategoryChannel> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new category-channel.
   * @param dto Data Transfer Object containing channel data
   * @returns The created CategoryChannel entity
   */
  @Post()
  create(@Body() dto: CreateCategoryChannelDto): Promise<CategoryChannel> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing channel by its ID.
   * @param id CategoryChannel identifier
   * @param dto Data to update
   * @returns Updated CategoryChannel entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCategoryChannelDto,
  ): Promise<CategoryChannel> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a category-channel.
   * @param id CategoryChannel identifier
   * @returns CategoryChannel entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<CategoryChannel> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a channel by its ID.
   * @param id CategoryChannel identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
