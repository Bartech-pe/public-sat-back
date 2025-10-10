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
import { ChannelAssistanceService } from './channel-assistance.service';
import { CreateChannelAssistanceDto } from './dto/create-channel-assistance.dto';
import { UpdateChannelAssistanceDto } from './dto/update-channel-assistance.dto';
import { ChannelAssistance } from './entities/channel-assistance.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing ChannelAssistances.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for citizens.
 */
@ApiBearerAuth()
@Controller('channel-assistances')
export class ChannelAssistanceController {
  constructor(private readonly service: ChannelAssistanceService) {}

  /**
   * Retrieves a paginated list of citizens.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing citizens
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChannelAssistance>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single citizen by its ID.
   * @param id ChannelAssistance identifier
   * @returns ChannelAssistance entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<ChannelAssistance> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new citizen.
   * @param dto Data Transfer Object containing citizen data
   * @returns The created ChannelAssistance entity
   */
  @Post()
  create(@Body() dto: CreateChannelAssistanceDto): Promise<ChannelAssistance> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing citizen by its ID.
   * @param id ChannelAssistance identifier
   * @param dto Data to update
   * @returns Updated ChannelAssistance entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateChannelAssistanceDto,
  ): Promise<ChannelAssistance> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a citizen.
   * @param id ChannelAssistance identifier
   * @returns ChannelAssistance entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<ChannelAssistance> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a citizen by its ID.
   * @param id ChannelAssistance identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Get('findByDocIde/:docIde')
  findByDocIde(@Param('docIde') docIde: string): Promise<ChannelAssistance[]> {
    return this.service.findByDocIde(docIde);
  }
}
