import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChannelSchedule } from './entities/channel-schedule.entity';
import { ChannelScheduleService } from './channel-schedule.service';
import { ChannelScheduleController } from './channel-schedule.controller';
import { ChannelScheduleRepository } from './repositories/channel-schedule.repository';

@Module({
  imports: [SequelizeModule.forFeature([ChannelSchedule])],
  controllers: [ChannelScheduleController],
  providers: [ChannelScheduleService, ChannelScheduleRepository],
  exports: [ChannelScheduleService, ChannelScheduleRepository],
})
export class ChannelScheduleModule {}
