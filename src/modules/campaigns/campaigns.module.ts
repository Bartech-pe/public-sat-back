import { Module } from '@nestjs/common';
import { EmailTemplateModule } from './email-template/email-template.module';
import { AudioCampaignModule } from './audio-campaign/audio-campaign.module';
import { EmailCampaignModule } from './email-campaign/email-campaign.module';
import { SmsCampaignModule } from './sms-campaign/sms-campaign.module';
import { CampaignScheduleModule } from './campaign-schedule/campaign-schedule.module';

@Module({
  imports: [
    EmailTemplateModule,
    AudioCampaignModule,
    EmailCampaignModule,
    SmsCampaignModule,
    CampaignScheduleModule,
  ],
})
export class CampaignsModule {}
