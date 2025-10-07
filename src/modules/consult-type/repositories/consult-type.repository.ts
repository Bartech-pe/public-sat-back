import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ConsultType } from '../entities/consult-type.entity';

/**
 * Repository for ConsultType entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to ConsultType in the future.
 */
@Injectable()
export class ConsultTypeRepository extends GenericCrudRepository<ConsultType> {
  constructor(
    @InjectModel(ConsultType)
    model: typeof ConsultType,
  ) {
    super(model);
  }
}
