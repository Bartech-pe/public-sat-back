import { Body, Controller, Post } from '@nestjs/common';
import { VicidialApiService } from './vicidial-api.service';

@Controller('vicidial-api')
export class VicidialApiController {
  constructor(private readonly service: VicidialApiService) {}
}
