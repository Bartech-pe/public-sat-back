import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { RoleScreenOffice } from '../entities/role-screen-office.entity';

@Injectable()
export class RoleScreenOfficeRepository extends GenericCrudRepository<RoleScreenOffice> {
  constructor(
    @InjectModel(RoleScreenOffice)
    model: typeof RoleScreenOffice,
  ) {
    super(model);
  }
}
