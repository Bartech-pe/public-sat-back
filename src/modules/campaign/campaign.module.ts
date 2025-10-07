import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Campaign } from './entities/campaign.entity';
import { CampaignController } from './controllers/campaign.controller';
import { CampaignService } from './services/campaign.service';
import { CampaignRepository } from './repositories/campaign.repository';

@Module({
  imports: [SequelizeModule.forFeature([Campaign])],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignRepository],
})
export class CampaignModule {}
