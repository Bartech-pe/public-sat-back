import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { MessagePreview } from '../dto/message-preview.dto';
import { CreateSmsCampaignDto } from '../dto/create-sms-campaign.dto';
import { UpdateSmsCampaignDto } from '../dto/update-sms-campaign.dto';
import { SmsCampaignService } from '../services/sms-campaign.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SmsCampaign } from '../entities/sms-campaign.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

@Controller('sms-campaigns')
export class SmsCampaignController {
  constructor(private readonly smsCampaignService: SmsCampaignService) {}

  @Post('readSMSExcel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    return this.smsCampaignService.readSMSExcel(file.buffer);
  }

  @Post('preview')
  async previewMessage(@Body() body: MessagePreview) {
    return await this.smsCampaignService.getMessages(
      body.rows,
      body.message,
      body.contact,
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSmsCampaignDto })
  create(
      @CurrentUser() user: User,
      @Body() dto: CreateSmsCampaignDto,
      @UploadedFile() file: Express.Multer.File,
  ): Promise<SmsCampaign> {
      return this.smsCampaignService.createSmsCampaign(dto, file,user.id);
  }   

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.smsCampaignService.remove(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSmsCampaignDto) {
    return this.smsCampaignService.update(id, dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.smsCampaignService.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.smsCampaignService.findOne(+id);
  }

  @Post('sendMessages')
  async sendMessages(@Body() body: MessagePreview) {
    return await this.smsCampaignService.buildMessages(
      body.rows,
      body.message,
      body.contact,
    );
  }

  @Get('view/:id')
  viewMessageDetails(@Param('id') id: number) {
    return this.smsCampaignService.viewMessageDetails(+id);
  }
  
}
