import { Module } from '@nestjs/common';
import { SmsCampaign } from './entities/sms-campaign.entity';
import { SmsCampaignDetail } from './entities/sms-campaign-detail.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { CampaignTypeModule } from '@modules/campaign-type/campaign-type.module';
import { SmsCampaignController } from './controllers/sms-campaign.controller';
import { SmsCampaignService } from './services/sms-campaign.service';
import { SmsCampaignRepository } from './repositories/sms-campaign.repository';
import { SrvmensajeriaModule } from '@modules/api-sat/srvmensajeria/srvmensajeria.module';

@Module({
  imports: [
    SequelizeModule.forFeature([SmsCampaign, SmsCampaignDetail]),
    ScheduleModule,
    CampaignTypeModule,
    SrvmensajeriaModule,
  ],
  controllers: [SmsCampaignController],
  providers: [SmsCampaignService, SmsCampaignRepository],
  exports: [SmsCampaignService, SmsCampaignRepository],
})
export class SmsCampaignModule {}
