import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Reminder } from '../entities/reminder.entity';

/**
 * Repository for Reminder entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Reminder in the future.
 */
@Injectable()
export class ReminderRepository extends GenericCrudRepository<Reminder> {
  constructor(
    @InjectModel(Reminder)
    model: typeof Reminder,
  ) {
    super(model);
  }
}
