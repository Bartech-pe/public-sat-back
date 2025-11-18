// audio.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioStoreService } from '../services/audio-store.service';
import { VicidialLists } from '../entities/vicidial-lists.entity';
import { CreateVicidialListDto } from '../dto/create-vicidial-lists.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AudioStoreDetails } from '../entities/audio-store-details.entity';

@Controller('audio-store')
export class AudioController {
  constructor(private readonly audioService: AudioStoreService) {}

  @Get('directory')
  getAudioStoreDirectory(): Promise<{ url: string }> {
    return this.audioService.getAudioStoreDirectory();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    return this.audioService.processAndUpload(file);
  }

  @Get('listas')
  findAll(): Promise<VicidialLists[]> {
    return this.audioService.findAllList();
  }

  @Post('listas')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVicidialListDto })
  create(
    @Body() dto: Omit<CreateVicidialListDto, 'file'>,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ status: string; data: VicidialLists }> {
    return this.audioService.createlistar(dto, file);
  }

  @Get('listas/:campaignId')
  findAllByCampaign(
    @Param('campaignId') campaignId: string,
  ): Promise<VicidialLists[]> {
    return this.audioService.findAllListByCampaign(campaignId);
  }

  @Get('audios')
  findAllAudios(): Promise<AudioStoreDetails[]> {
    return this.audioService.findAllAudiosList();
  }

  @Post('new/listas')
  createnew(@Body() body: CreateVicidialListDto) {
    return this.audioService.createlistas(body);
  }

  @Patch('campanias/list/:id')
  updateList(@Param('id') listId: number, @Body() dto: any) {
    return this.audioService.updateList(listId, dto);
  }

  @Post('listasMultiple')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVicidialListDto })
  createMultiple(
    @Body() dto: Omit<CreateVicidialListDto, 'file'>,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ status: string; data: VicidialLists }> {
    return this.audioService.createlistarMultiple(dto, file);
  }

  @Get('listasMultiple/:campaignId')
  findAllBylistasMultiple(
    @Param('campaignId') campaignId: any,
  ): Promise<VicidialLists[]> {
    return this.audioService.findAllBylistasMultiple(campaignId);
  }
}
