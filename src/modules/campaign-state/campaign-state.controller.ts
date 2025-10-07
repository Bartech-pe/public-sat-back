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
import { CampaignStateService } from './campaign-state.service';
import { CreateCampaignStateDto } from './dto/create-campaign-state.dto';
import { UpdateCampaignStateDto } from './dto/update-campaign-state.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { CampaignState } from './entities/campaign-state.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Campaign States.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Campaign State.
 */
@ApiBearerAuth()
@Controller('campaign-states')
export class CampaignStateController {
  constructor(private readonly service: CampaignStateService) {}

  /**
   * Retrieves a paginated list of campaign states.
   * @param user Current authenticated user
   * @param query Pagination parameters (limit, offset, filters)
   * @returns PaginatedResponse containing campaign states
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CampaignState>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single campaign state by ID.
   * @param id CampaignState identifier
   * @returns The CampaignState entity if found
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<CampaignState> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new campaign state.
   * @param dto Data Transfer Object with campaign state details
   * @returns The created CampaignState entity
   */
  @Post()
  create(@Body() dto: CreateCampaignStateDto): Promise<CampaignState> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing campaign state by ID.
   * @param id CampaignState identifier
   * @param dto Data Transfer Object with updated values
   * @returns The updated CampaignState entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCampaignStateDto,
  ): Promise<CampaignState> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a campaign state.
   * @param id CampaignState identifier
   * @returns CampaignState entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<CampaignState> {
    return this.service.toggleStatus(id);
  }

  /**
   * Removes (soft delete) a campaign state by its ID.
   * @param id CampaignState identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
