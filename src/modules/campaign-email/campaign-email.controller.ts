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
import { CampaignEmailService } from './campaign-email.service';
import { CreateCampaignEmailDto } from './dto/create-campaign-email.dto';
import { UpdateCampaignEmailDto } from './dto/update-campaign-email.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignEmail } from './entities/campaign-email.entity';

@Controller('campaign-email')
export class CampaignEmailController {

  constructor(private readonly service: CampaignEmailService) { }

  @Post('/bulk')
  async enqueueEmails(@Body() emails: CreateCampaignEmailDto[]) {
    return this.service.enqueueEmails(emails);
  }
  
  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<CampaignEmail>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CampaignEmail> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCampaignEmailDto): Promise<CampaignEmail> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCampaignEmailDto): Promise<CampaignEmail> {
    return this.service.update(+id, dto);
  }

  @Put('toggleTag/:id')
  toggleTag(@Param('id') id: number): Promise<CampaignEmail> {
    return this.service.toggleTag(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
