import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { GenericAssistance } from '../entities/generic-assistance.entity';

/**
 * Repository for GenericAssistance entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to GenericAssistance in the future.
 */
@Injectable()
export class GenericAssistanceRepository extends GenericCrudRepository<GenericAssistance> {
  constructor(
    @InjectModel(GenericAssistance)
    model: typeof GenericAssistance,
  ) {
    super(model);
  }
}
