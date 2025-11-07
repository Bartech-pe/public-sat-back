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
import { AudioCampaignService } from '../services/audio-campaign.service';
import { CreateAudioCampaignDto } from '../dto/create-audio-campaign.dto';
import { UpdateAudioCampaignDto } from '../dto/update-audio-campaign.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { AudioCampaign } from '../entities/audio-campaign.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing AudioCampaigns.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for campaigns.
 */
@ApiBearerAuth()
@Controller('audio-campaigns')
export class AudioCampaignController {
  constructor(private readonly service: AudioCampaignService) {}

  /**
   * Retrieves a paginated list of campaigns.
   * @param user Current authenticated user
   * @param query Pagination query parameters
   * @returns PaginatedResponse of AudioCampaign entities
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<AudioCampaign>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single campaign by its ID.
   * @param id AudioCampaign identifier
   * @returns AudioCampaign entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AudioCampaign> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new campaign.
   * @param dto Data Transfer Object containing campaign data
   * @returns The created campaign
   */
  @Post()
  create(@Body() dto: CreateAudioCampaignDto): Promise<AudioCampaign> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing campaign by its ID.
   * @param id AudioCampaign identifier
   * @param dto Data to update
   * @returns Updated campaign
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAudioCampaignDto,
  ): Promise<AudioCampaign> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status of a campaign (active/inactive).
   * @param id AudioCampaign identifier
   * @returns AudioCampaign with updated status
   */
  @Put('toggleStatus/:id')
  toggleAudioCampaign(@Param('id') id: number): Promise<AudioCampaign> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft-delete) a campaign by its ID.
   * @param id AudioCampaign identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
