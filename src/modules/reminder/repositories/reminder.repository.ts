import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Reminder } from '../entities/reminder.entity';

@Injectable()
export class ReminderRepository extends GenericCrudRepository<Reminder> {
  constructor(
    @InjectModel(Reminder)
    model: typeof Reminder,
  ) {
      super(model);
  }
}
