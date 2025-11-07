import { Module } from '@nestjs/common';
import { EmailCampaignDetailService } from './services/email-campaign-detail.service';
import { EmailCampaignDetailController } from './controllers/email-campaign-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailCampaign } from './entities/email-campaign.entity';
import { EmailCampaignDetail } from './entities/email-campaign-detail.entity';
import { BullModule } from '@nestjs/bullmq';
import { EmailCampaignRepository } from './repositories/email-campaign.repository';
import { EmailCampaignProcessor } from './email-campaign.processor';
import { EmailCampaignAttachment } from './entities/email-campaign-attachment.entity';
import { EmailCampaignController } from './controllers/email-campaing.controller';
import { EmailCampaignDetailRepository } from './repositories/email-campaign-detail.repository';
import { EmailCampaignService } from './services/email-campaign.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EmailCampaign,
      EmailCampaignDetail,
      EmailCampaignAttachment,
    ]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [EmailCampaignController, EmailCampaignDetailController],
  providers: [
    EmailCampaignProcessor,
    EmailCampaignService,
    EmailCampaignDetailService,
    EmailCampaignRepository,
    EmailCampaignDetailRepository,
  ],
  exports: [EmailCampaignRepository],
})
export class EmailCampaignModule {}
