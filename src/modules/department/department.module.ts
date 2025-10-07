import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Department } from './entities/department.entity';
import { DepartmentRepository } from './repositories/department.repository';

@Module({
  imports: [SequelizeModule.forFeature([Department])],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentRepository],
  exports: [DepartmentService, DepartmentRepository],
})
export class DepartmentModule {}
