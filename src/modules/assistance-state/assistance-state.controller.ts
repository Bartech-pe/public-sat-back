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
import { AssistanceStateService } from './assistance-state.service';
import { CreateAssistanceStateDto } from './dto/create-assistance-state.dto';
import { UpdateAssistanceStateDto } from './dto/update-assistance-state.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { AssistanceState } from './entities/assistance-state.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing AssistanceStates.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for assistance status.
 */

@ApiBearerAuth()
@Controller('assistance-states')
export class AssistanceStateController {
  constructor(private readonly service: AssistanceStateService) {}

  /**
   * Retrieves a paginated list of assistance status.
   * @param user Current authenticated user
   * @param query Pagination query parameters
   * @returns PaginatedResponse of AssistanceState entities
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<AssistanceState>> {
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
  @Put('assistanceStateEmail')
  findAllChannelStateEmail(
    @CurrentUser() user: User,
  ): Promise<AssistanceState[]> {
    return this.service.findAllAssistanceStateEmail(user);
  }

  /**
   * Retrieves a single assistance status by its ID.
   * @param id AssistanceState identifier
   * @returns AssistanceState entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AssistanceState> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new assistance status.
   * @param dto Data Transfer Object containing assistance status data
   * @returns The created assistance status
   */
  @Post()
  create(@Body() dto: CreateAssistanceStateDto): Promise<AssistanceState> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing assistance status by its ID.
   * @param id AssistanceState identifier
   * @param dto Data to update
   * @returns Updated assistance status
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAssistanceStateDto,
  ): Promise<AssistanceState> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status of a assistance status (active/inactive).
   * @param id AssistanceState identifier
   * @returns AssistanceState with updated status
   */
  @Put('toggleStatus/:id')
  toggleAssistanceState(@Param('id') id: number): Promise<AssistanceState> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft-delete) a assistance status by its ID.
   * @param id AssistanceState identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
