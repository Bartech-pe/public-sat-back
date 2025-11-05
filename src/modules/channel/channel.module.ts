import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './repositories/channel.repository';

@Module({
  imports: [SequelizeModule.forFeature([Channel])],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository],
  exports: [ChannelRepository],
})
export class ChannelModule {}
