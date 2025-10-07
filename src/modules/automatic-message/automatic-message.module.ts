import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutomaticMessageService } from './automatic-message.service';
import { AutomaticMessageController } from './automatic-message.controller';
import { AutomaticMessageRepository } from './repositories/automatic-message.repository';
import { AutomaticMessage } from './entities/automatic-message.entity';

@Module({
  imports: [SequelizeModule.forFeature([AutomaticMessage])],
  controllers: [AutomaticMessageController],
  providers: [AutomaticMessageService, AutomaticMessageRepository],
  exports: [AutomaticMessageRepository],
})
export class AutomaticMessageModule {}
