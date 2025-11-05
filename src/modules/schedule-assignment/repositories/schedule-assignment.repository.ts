import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ScheduleAssignment } from '../entities/schedule-assignment.entity';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';

@Injectable()
export class ScheduleAssignmentRepository    extends GenericCrudRepository<ScheduleAssignment> {
  constructor(
      @InjectModel(ScheduleAssignment)
      model: typeof ScheduleAssignment,
    ) {
      super(model);
    }
}
