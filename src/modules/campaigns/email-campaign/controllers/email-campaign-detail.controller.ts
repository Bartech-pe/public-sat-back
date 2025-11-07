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
import { EmailCampaignDetailService } from '../services/email-campaign-detail.service';
import { CreateEmailCampaignDetailDto } from '../dto/create-email-campaign-detail.dto';
import { UpdateEmailCampaignDetailDto } from '../dto/update-email-campaign-detail.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EmailCampaignDetail } from '../entities/email-campaign-detail.entity';

@Controller('email-campaign-details')
export class EmailCampaignDetailController {
  constructor(private readonly service: EmailCampaignDetailService) {}

  @Post('/bulk')
  async enqueueEmails(@Body() emails: CreateEmailCampaignDetailDto[]) {
    return this.service.enqueueEmails(emails);
  }

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EmailCampaignDetail>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<EmailCampaignDetail> {
    return this.service.findOne(+id);
  }

  @Post()
  create(
    @Body() dto: CreateEmailCampaignDetailDto,
  ): Promise<EmailCampaignDetail> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEmailCampaignDetailDto,
  ): Promise<EmailCampaignDetail> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<EmailCampaignDetail> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
