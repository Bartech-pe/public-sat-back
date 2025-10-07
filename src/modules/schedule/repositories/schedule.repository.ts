import { Injectable } from '@nestjs/common';
import { Schedule } from '../entities/schedule.entity';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';

@Injectable()
export class ScheduleRepository extends GenericCrudRepository<Schedule> {
  constructor(
    @InjectModel(Schedule)
    model: typeof Schedule,
  ) {
    super(model);
  }
}
