import { Module } from '@nestjs/common';
import { CampaingService } from './campaing.service';
import { CampaingController } from './campaing.controller';

@Module({
  controllers: [CampaingController],
  providers: [CampaingService],
})
export class CampaingModule {}
