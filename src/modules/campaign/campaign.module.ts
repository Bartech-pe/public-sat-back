import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Campaign } from './entities/campaign.entity';
import { CampaignController } from './controllers/campaign.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignRepository } from './repositories/campaign.repository';
import { SmsCampaingDetail } from './entities/sms-campaing-detail.entity.ts';
import { ScheduleModule } from '@nestjs/schedule';
import { CampaignTypeModule } from '@modules/campaign-type/campaign-type.module';
import { SmsCampaingController } from './controllers/sms-campaing.controller';
import { SmsCampaingDetailRepository } from './repositories/sms-campaing-detail.repository';
import { SmsCampaingService } from './services/sms-campaing.service';
import { SmsChannelService } from './services/sms-channel.service';

@Module({
   imports: [SequelizeModule.forFeature([Campaign,SmsCampaingDetail]),ScheduleModule,CampaignTypeModule],
  controllers: [CampaignController,SmsCampaingController],
  providers: [CampaignService, CampaignRepository,SmsCampaingDetailRepository,SmsChannelService,SmsCampaingService],
  exports: [CampaignRepository],
})
export class CampaignModule {}

/*@Module({
  imports: [SequelizeModule.forFeature([Campaign,SmsCampaingDetail]),ScheduleModule,CampaignTypeModule],
  controllers: [CampaignController,SmsCampaingController],
  providers: [CampaignService, CampaignRepository,SmsCampaingDetailRepository,SmsChannelService,SmsCampaingService],
  exports: [CampaignRepository],
})*/
