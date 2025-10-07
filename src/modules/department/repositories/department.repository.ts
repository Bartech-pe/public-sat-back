import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentRepository extends GenericCrudRepository<Department> {
  constructor(
    @InjectModel(Department)
    model: typeof Department,
  ) {
    super(model);
  }
}
