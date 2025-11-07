import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AudioCampaign } from './entities/audio-campaign.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CampaignTypeModule } from '@modules/campaign-type/campaign-type.module';
import { AudioCampaignController } from './controllers/audio-campaign.controller';
import { AudioCampaignService } from './services/audio-campaign.service';
import { AudioCampaignRepository } from './repositories/audio-campaign.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([AudioCampaign]),
    ScheduleModule,
    CampaignTypeModule,
  ],
  controllers: [AudioCampaignController],
  providers: [AudioCampaignService, AudioCampaignRepository],
  exports: [AudioCampaignService, AudioCampaignRepository],
})
export class AudioCampaignModule {}
