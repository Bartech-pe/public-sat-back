import { Module } from '@nestjs/common';
import { ChannelAssistanceService } from './channel-assistance.service';
import { ChannelAssistanceController } from './channel-assistance.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChannelAssistance } from './entities/channel-assistance.entity';
import { ChannelAssistanceRepository } from './repositories/channel-assistance.repository';
import { CitizenModule } from '@modules/citizen/citizen.module';

@Module({
  imports: [SequelizeModule.forFeature([ChannelAssistance]), CitizenModule],
  controllers: [ChannelAssistanceController],
  providers: [ChannelAssistanceService, ChannelAssistanceRepository],
  exports: [ChannelAssistanceService, ChannelAssistanceRepository],
})
export class ChannelAssistanceModule {}
