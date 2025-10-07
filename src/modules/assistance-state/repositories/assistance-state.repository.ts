import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AssistanceState } from '../entities/assistance-state.entity';

/**
 * Repository for AssistanceState entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to AssistanceState in the future.
 */
@Injectable()
export class AssistanceStateRepository extends GenericCrudRepository<AssistanceState> {
  constructor(
    @InjectModel(AssistanceState)
    model: typeof AssistanceState,
  ) {
    super(model);
  }
}
