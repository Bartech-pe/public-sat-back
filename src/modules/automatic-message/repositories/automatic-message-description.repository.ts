import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AutomaticMessage } from '../entities/automatic-message.entity';
import { AutomaticMessageDescription } from '../entities/automatic-message-description.entity';

/**
 * Repository for AutomaticMessage entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to AutomaticMessage in the future.
 */
@Injectable()
export class AutomaticMessageDescriptionRepository extends GenericCrudRepository<AutomaticMessageDescription> {
  constructor(
    @InjectModel(AutomaticMessageDescription)
    model: typeof AutomaticMessageDescription,
  ) {
    super(model);
  }
}
