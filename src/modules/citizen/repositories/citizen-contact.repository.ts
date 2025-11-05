import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CitizenContact } from '../../citizen/entities/citizen-contact.entity';

/**
 * Repository for CitizenContact entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to CitizenContact in the future.
 */
@Injectable()
export class CitizenContactRepository extends GenericCrudRepository<CitizenContact> {
  constructor(
    @InjectModel(CitizenContact)
    model: typeof CitizenContact,
  ) {
    super(model);
  }
}
