import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import { ScheduleAssignmentService } from './schedule-assignment.service';
import { ScheduleAssignmentController } from './schedule-assignment.controller';
import { ScheduleAssignmentRepository } from './repositories/schedule-assignment.repository';

@Module({
  imports: [SequelizeModule.forFeature([ScheduleAssignment])],
  controllers: [ScheduleAssignmentController],
  providers: [ScheduleAssignmentService, ScheduleAssignmentRepository],
  exports: [ScheduleAssignmentService,ScheduleAssignmentRepository],
})
export class ScheduleAssignmentModule {}
