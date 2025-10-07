import { Module } from '@nestjs/common';
import { ChannelService } from './services/channel.service';
import { ChannelController } from './controllers/channel.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './repositories/channel.repository';
import { CategoryChannel } from './entities/category-channel.entity';
import { CategoryChannelController } from './controllers/category-channel.controller';
import { CategoryChannelService } from './services/category-channel.service';
import { CategoryChannelRepository } from './repositories/category-channel.repository';

@Module({
  imports: [SequelizeModule.forFeature([Channel, CategoryChannel])],
  controllers: [ChannelController, CategoryChannelController],
  providers: [
    ChannelService,
    ChannelRepository,
    CategoryChannelService,
    CategoryChannelRepository,
  ],
  exports: [ChannelRepository, CategoryChannelRepository],
})
export class ChannelModule {}
