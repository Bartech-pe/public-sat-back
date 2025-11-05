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
import { CampaignTypeService } from './campaign-type.service';
import { CreateCampaignTypeDto } from './dto/create-campaign-type.dto';
import { UpdateCampaignTypeDto } from './dto/update-campaign-type.dto';
import { CampaignType } from './entities/campaign-type.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Campaign types.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Campaign types.
 */
@ApiBearerAuth()
@Controller('campaign-types')
export class CampaignTypeController {
  constructor(private readonly service: CampaignTypeService) {}

  /**
   * Retrieves a paginated list of campaign types.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing campaign types
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CampaignType>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single campaign type by its ID.
   * @param id CampaignType identifier
   * @returns CampaignType entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<CampaignType> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new campaign type.
   * @param dto Data Transfer Object containing campaign type data
   * @returns The created CampaignType entity
   */
  @Post()
  create(@Body() dto: CreateCampaignTypeDto): Promise<CampaignType> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing campaign type by its ID.
   * @param id CampaignType identifier
   * @param dto Data to update
   * @returns Updated CampaignType entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCampaignTypeDto,
  ): Promise<CampaignType> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a campaign type.
   * @param id CampaignType identifier
   * @returns CampaignType entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<CampaignType> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a campaign type by its ID.
   * @param id CampaignType identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
