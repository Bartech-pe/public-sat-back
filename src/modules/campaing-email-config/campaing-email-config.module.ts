import { Module } from '@nestjs/common';
import { CampaingEmailConfigService } from './campaing-email-config.service';
import { CampaingEmailConfigController } from './campaing-email-config.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignEmailConfig } from './entities/campaing-email-config.entity';
import { CampaignEmailConfigRepository } from './repositories/campaign-email-config.repository';
import { CampaignEmailModule } from '@modules/campaign-email/campaign-email.module';

@Module({
  imports: [SequelizeModule.forFeature([CampaignEmailConfig]),CampaignEmailModule],
  controllers: [CampaingEmailConfigController],
  providers: [CampaingEmailConfigService,CampaignEmailConfigRepository],
  exports: [CampaignEmailConfigRepository],
})
export class CampaingEmailConfigModule {}
