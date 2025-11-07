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
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { EmailCampaignService } from '../services/email-campaign.service';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { UpdateEmailCampaignDto } from '../dto/update-email-campaign.dto';
import { CreateEmailCampaignDto } from '../dto/create-email-campaign.dto';
import { EmailCampaignDetailService } from '../services/email-campaign-detail.service';
import { EmailCampaignDetail } from '../entities/email-campaign-detail.entity';

@Controller('email-campaigns')
export class EmailCampaignController {
  constructor(
    private readonly service: EmailCampaignService,
    private readonly serviceDetail: EmailCampaignDetailService,
  ) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EmailCampaign>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<EmailCampaign> {
    return this.service.findOne(+id);
  }

  @Get('progress/:id')
  findOneAll(
    @Param('id') id: number,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EmailCampaignDetail>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.serviceDetail.findAllByEmailCampaignId(id, limit, offset);
  }

  @Post()
  create(@Body() dto: CreateEmailCampaignDto): Promise<EmailCampaign> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<EmailCampaign> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
