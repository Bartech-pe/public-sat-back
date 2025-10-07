import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../entities/role.entity';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';

@Injectable()
export class RoleRepository extends GenericCrudRepository<Role> {
  constructor(
    @InjectModel(Role)
    model: typeof Role,
  ) {
    super(model);
  }
}
