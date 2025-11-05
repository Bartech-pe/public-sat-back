import { Module } from '@nestjs/common';
import { CampaignTypeService } from './campaign-type.service';
import { CampaignTypeController } from './campaign-type.controller';
import { CampaignTypeRepository } from './repositories/campaign-type.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignType } from './entities/campaign-type.entity';

@Module({
  imports: [SequelizeModule.forFeature([CampaignType])],
  controllers: [CampaignTypeController],
  providers: [CampaignTypeService, CampaignTypeRepository],
  exports: [CampaignTypeRepository],
})
export class CampaignTypeModule {}
