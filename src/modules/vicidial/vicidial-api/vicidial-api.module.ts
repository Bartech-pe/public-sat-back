import { Module } from '@nestjs/common';
import { VicidialApiController } from './vicidial-api.controller';
import { VicidialApiService } from './vicidial-api.service';

@Module({
  controllers: [VicidialApiController],
  providers: [VicidialApiService],
  exports: [VicidialApiService],
})
export class VicidialApiModule {}
