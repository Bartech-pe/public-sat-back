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
import { ConsultTypeService } from './consult-type.service';
import { CreateConsultTypeDto } from './dto/create-consult-type.dto';
import { UpdateConsultTypeDto } from './dto/update-consult-type.dto';
import { ConsultType } from './entities/consult-type.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing ConsultTypes.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for consult-types.
 */
@ApiBearerAuth()
@Controller('consult-types')
export class ConsultTypeController {
  constructor(private readonly service: ConsultTypeService) {}

  /**
   * Retrieves a paginated list of consult-types.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing consult-types
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ConsultType>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single consult-type by its ID.
   * @param id ConsultType identifier
   * @returns ConsultType entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<ConsultType> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new consult-type.
   * @param dto Data Transfer Object containing consult-type data
   * @returns The created ConsultType entity
   */
  @Post()
  create(@Body() dto: CreateConsultTypeDto): Promise<ConsultType> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing consult-type by its ID.
   * @param id ConsultType identifier
   * @param dto Data to update
   * @returns Updated ConsultType entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateConsultTypeDto,
  ): Promise<ConsultType> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a consult-type.
   * @param id ConsultType identifier
   * @returns ConsultType entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<ConsultType> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a consult-type by its ID.
   * @param id ConsultType identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
