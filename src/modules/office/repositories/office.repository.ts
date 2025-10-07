import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Office } from '../entities/office.entity';

@Injectable()
export class OfficeRepository extends GenericCrudRepository<Office> {
  constructor(
    @InjectModel(Office)
    model: typeof Office,
  ) {
    super(model);
  }
}
