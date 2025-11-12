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
import { GenericAssistanceService } from '../services/generic_assistance.service';
import { CreateGenericAssistanceDto } from '../dto/create-generic-assistance.dto';
import { UpdateGenericAssistanceDto } from '../dto/update-generic-assistance.dto';
import { GenericAssistance } from '../entities/generic-assistance.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing GenericAssistances.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for citizens.
 */
@ApiBearerAuth()
@Controller('generic-assistances')
export class GenericAssistanceController {
  constructor(private readonly service: GenericAssistanceService) {}

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
  ): Promise<PaginatedResponse<GenericAssistance>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single citizen by its ID.
   * @param id GenericAssistance identifier
   * @returns GenericAssistance entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<GenericAssistance> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new citizen.
   * @param dto Data Transfer Object containing citizen data
   * @returns The created GenericAssistance entity
   */
  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateGenericAssistanceDto,
  ): Promise<GenericAssistance> {
    console.log('user', user);
    return this.service.create(dto, user.officeId ?? undefined);
  }

  /**
   * Updates an existing citizen by its ID.
   * @param id GenericAssistance identifier
   * @param dto Data to update
   * @returns Updated GenericAssistance entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateGenericAssistanceDto,
  ): Promise<GenericAssistance> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a citizen.
   * @param id GenericAssistance identifier
   * @returns GenericAssistance entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<GenericAssistance> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a citizen by its ID.
   * @param id GenericAssistance identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Get('findByDocIde/:docIde')
  findByDocIde(@Param('docIde') docIde: string): Promise<GenericAssistance[]> {
    return this.service.findByDocIde(docIde);
  }
}
