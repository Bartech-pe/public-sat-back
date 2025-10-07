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
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Campaign } from '../entities/campaign.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Campaigns.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for campaigns.
 */
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly service: CampaignService) {}

  /**
   * Retrieves a paginated list of campaigns.
   * @param user Current authenticated user
   * @param query Pagination query parameters
   * @returns PaginatedResponse of Campaign entities
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Campaign>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single campaign by its ID.
   * @param id Campaign identifier
   * @returns Campaign entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Campaign> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new campaign.
   * @param dto Data Transfer Object containing campaign data
   * @returns The created campaign
   */
  @Post()
  create(@Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing campaign by its ID.
   * @param id Campaign identifier
   * @param dto Data to update
   * @returns Updated campaign
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status of a campaign (active/inactive).
   * @param id Campaign identifier
   * @returns Campaign with updated status
   */
  @Put('toggleStatus/:id')
  toggleCampaign(@Param('id') id: number): Promise<Campaign> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft-delete) a campaign by its ID.
   * @param id Campaign identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
