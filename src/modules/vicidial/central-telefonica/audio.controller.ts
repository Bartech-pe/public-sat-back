// audio.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './services/audio.service';
import { VicidialLists } from './entities/vicidial-lists.entity';
import { CreateVicidialListDto } from './dto/create-vicidial-lists.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { VicidialLead } from './entities/vicidial-list.entity';
import { AudioStoreDetails } from './entities/audio-store-details.entity';

@Controller('central')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    return this.audioService.processAndUpload(file);
  }
  
  @Get('listas')
  findAll(): Promise<VicidialLists[]> {
      return this.audioService.findAllList();
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

  @Post('listas')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVicidialListDto })
  create(
      @Body() dto: Omit<CreateVicidialListDto, 'file'>,
      @UploadedFile() file: Express.Multer.File,
  ): Promise<VicidialLists> {
      return this.audioService.createlistar(dto,file);
  }

  @Patch('campanias/list/:id')
  updateList(@Param('id') listId: number, @Body() dto:any){
      return this.audioService.updateList(listId, dto);
  }


}
