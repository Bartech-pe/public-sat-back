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
import { CampaingEmailConfigService } from './campaing-email-config.service';
import { CreateCampaingEmailConfigDto } from './dto/create-campaing-email-config.dto';
import { UpdateCampaingEmailConfigDto } from './dto/update-campaing-email-config.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignEmailConfig } from './entities/campaing-email-config.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { CampaignEmail } from '@modules/campaign-email/entities/campaign-email.entity';

@Controller('campaing-email-config')
export class CampaingEmailConfigController {
  constructor(private readonly service: CampaingEmailConfigService) {}

  @Get()
    findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<CampaignEmailConfig>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<CampaignEmailConfig> {
      return this.service.findOne(+id);
    }

    @Get('progress/:id')
    findOneAll(@Param('id') id: number): Promise<CampaignEmail[]> {
      return this.service.findOneAll(+id);
    }
  
    @Post()
    create(@Body() dto: CreateCampaingEmailConfigDto): Promise<CampaignEmailConfig> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateCampaingEmailConfigDto): Promise<CampaignEmailConfig> {
      return this.service.update(+id, dto);
    }
  
    @Put('toggleCampaignEmailConfig/:id')
    toggleCampaignEmailConfig(@Param('id') id: number): Promise<CampaignEmailConfig> {
      return this.service.toggleCampaignEmailConfig(id);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
