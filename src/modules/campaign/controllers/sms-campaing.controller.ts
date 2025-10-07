import { SmsCampaingService } from '../services/sms-campaing.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagePreview } from '../dto/sms-campaing/message-preview.dto';
import { CreateSmsCampaing } from '../dto/sms-campaing/create-sms-campaing.dto';
import { UpdateSmsCampaing } from '../dto/sms-campaing/update-sms-campaing.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Controller('gestion-sms-campania')
export class SmsCampaingController {
  constructor(private readonly smsCampaingService: SmsCampaingService) {}

  @Post('readSMSExcel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    return this.smsCampaingService.readSMSExcel(file.buffer);
  }

  @Post('preview')
  async previewMessage(@Body() body: MessagePreview) {
    return await this.smsCampaingService.getMessages(
      body.rows,
      body.message,
      body.contact,
    );
  }

  @Post()
  async createSMSCampaing(@Body() body: CreateSmsCampaing) {
    return await this.smsCampaingService.createSmsCampaing(body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.smsCampaingService.remove(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSmsCampaing) {
    return this.smsCampaingService.update(id, dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.smsCampaingService.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.smsCampaingService.findOne(+id);
  }

  @Post('sendMessages')
  async sendMessages(@Body() body: MessagePreview) {
    return await this.smsCampaingService.buildMessages(
      body.rows,
      body.message,
      body.contact,
    );
  }
}
