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
import { CitizenService } from '../services/citizen.service';
import { CreateCitizenDto } from '../dto/create-citizen.dto';
import { UpdateCitizenDto } from '../dto/update-citizen.dto';
import { Citizen } from '../entities/citizen.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { CitizenContactDto } from '../dto/citizen-contact.dto';
import { CitizenContact } from '../entities/citizen-contact.entity';

/**
 * Controller for managing Citizens.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for citizens.
 */
@ApiBearerAuth()
@Controller('citizens')
export class CitizenController {
  constructor(private readonly service: CitizenService) {}

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
  ): Promise<PaginatedResponse<Citizen>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single citizen by its ID.
   * @param id Citizen identifier
   * @returns Citizen entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Citizen> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new citizen.
   * @param dto Data Transfer Object containing citizen data
   * @returns The created Citizen entity
   */
  @Post()
  create(@Body() dto: CreateCitizenDto): Promise<Citizen> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing citizen by its ID.
   * @param id Citizen identifier
   * @param dto Data to update
   * @returns Updated Citizen entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCitizenDto,
  ): Promise<Citizen> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a citizen.
   * @param id Citizen identifier
   * @returns Citizen entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Citizen> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a citizen by its ID.
   * @param id Citizen identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Post('citizen-contacts/multiple')
  createCitizenContactMultiple(
    @Body() dtoList: CitizenContactDto[],
  ): Promise<CitizenContact[]> {
    return this.service.createCitizenContactMultiple(dtoList);
  }

  @Get('citizen-contacts/:tipDoc/:docIde') getCitizenContactsByTipDocAndDocIde(
    @Param('tipDoc') tipDoc: string,
    @Param('docIde') docIde: string,
  ): Promise<CitizenContact[]> {
    return this.service.getCitizenContactsByTipDocAndDocIde(tipDoc, docIde);
  }

  /**
   * Deletes (soft delete) a contact citizen by its ID.
   * @param id Citizen identifier
   * @returns void
   */
  @Delete('citizen-contacts/:id')
  removeContact(@Param('id') id: number) {
    return this.service.removeContact(+id);
  }
}
