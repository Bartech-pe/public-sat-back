import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignSchedule } from './entities/campaign-schedule.entity';
import { CampaignScheduleController } from './campaign-schedule.controller';
import { CampaignScheduleService } from './campaign-schedule.service';
import { CampaignScheduleRepository } from './repositories/campaign-schedule.repository';

@Module({
  imports: [SequelizeModule.forFeature([CampaignSchedule])],
  controllers: [CampaignScheduleController],
  providers: [CampaignScheduleService, CampaignScheduleRepository],
  exports: [CampaignScheduleService, CampaignScheduleRepository],
})
export class CampaignScheduleModule {}
