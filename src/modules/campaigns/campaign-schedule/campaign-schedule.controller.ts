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
import { CampaignScheduleService } from './campaign-schedule.service';
import { CreateCampaignScheduleDto } from './dto/create-campaign-schedule.dto';
import { UpdateCampaignScheduleDto } from './dto/update-campaign-schedule.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignSchedule } from './entities/campaign-schedule.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Campaign Schedule.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Campaign Schedule.
 */
@ApiBearerAuth()
@Controller('campaign-schedules')
export class CampaignScheduleController {
  constructor(private readonly service: CampaignScheduleService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CampaignSchedule>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CampaignSchedule> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCampaignScheduleDto): Promise<CampaignSchedule> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCampaignScheduleDto,
  ): Promise<CampaignSchedule> {
    return this.service.update(+id, dto);
  }

  @Put('toggleTag/:id')
  toggleTag(@Param('id') id: number): Promise<CampaignSchedule> {
    return this.service.toggleTag(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
