import { Module } from '@nestjs/common';
import { ChannelStateService } from './channel-state.service';
import { ChannelStateController } from './channel-state.controller';
import { ChannelState } from './entities/channel-state.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChannelStateRepository } from './repositories/channel-state.repository';

@Module({
  imports: [SequelizeModule.forFeature([ChannelState])],
  controllers: [ChannelStateController],
  providers: [ChannelStateService, ChannelStateRepository],
  exports: [ChannelStateRepository],
})
export class ChannelStateModule {}
