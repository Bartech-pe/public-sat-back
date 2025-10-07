import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reminder } from './entities/reminder.entity';
import { ReminderRepository } from './repositories/reminder.repository';

@Module({
  imports: [SequelizeModule.forFeature([Reminder])],
  controllers: [ReminderController],
  providers: [ReminderService,ReminderRepository],
  exports: [ReminderRepository],
})
export class ReminderModule {}
