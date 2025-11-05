import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignStateService } from './campaign-state.service';
import { CampaignStateController } from './campaign-state.controller';
import { CampaignState } from './entities/campaign-state.entity';
import { CampaignStateRepository } from './repositories/campaign-state.repository';

@Module({
  imports: [SequelizeModule.forFeature([CampaignState])],
  controllers: [CampaignStateController],
  providers: [CampaignStateService, CampaignStateRepository],
  exports: [CampaignStateRepository],
})
export class CampaignStateModule {}
