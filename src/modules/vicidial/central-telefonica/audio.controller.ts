// audio.controller.ts
import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './services/audio.service';
import { VicidialLists } from './entities/vicidial-lists.entity';
import { CreateVicidialListDto } from './dto/create-vicidial-lists.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { VicidialLead } from './entities/vicidial-list.entity';

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


}
