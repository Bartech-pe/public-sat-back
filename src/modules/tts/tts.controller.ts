import { Body, Controller, Post, Res } from '@nestjs/common';
import { TtsService } from './tts.service';
import { Response } from 'express';

@Controller('tts')
export class TtsController {
  constructor(private readonly service: TtsService) {}

  @Post()
  async create(
    @Body() dto: { text: string },
    @Res() res: Response,
  ): Promise<any> {
    console.log('dto', dto);
    await this.service.create(dto, res);
  }
}
