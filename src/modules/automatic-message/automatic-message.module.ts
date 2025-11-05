import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutomaticMessageService } from './automatic-message.service';
import { AutomaticMessageController } from './automatic-message.controller';
import { AutomaticMessageRepository } from './repositories/automatic-message.repository';
import { AutomaticMessage } from './entities/automatic-message.entity';
import { AutomaticMessageDescription } from './entities/automatic-message-description.entity';
import { AutomaticMessageDescriptionRepository } from './repositories/automatic-message-description.repository';

@Module({
  imports: [SequelizeModule.forFeature([AutomaticMessage, AutomaticMessageDescription])],
  controllers: [AutomaticMessageController],
  providers: [AutomaticMessageService, AutomaticMessageRepository, AutomaticMessageDescriptionRepository],
  exports: [AutomaticMessageRepository, AutomaticMessageService],
})
export class AutomaticMessageModule {}
