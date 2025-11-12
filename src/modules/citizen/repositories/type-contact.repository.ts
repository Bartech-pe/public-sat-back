import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { TypeContact } from '../entities/type-contact.entity';

/**
 * Repository for TypeContact entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to TypeContact in the future.
 */
@Injectable()
export class TypeContactRepository extends GenericCrudRepository<TypeContact> {
  constructor(
    @InjectModel(TypeContact)
    model: typeof TypeContact,
  ) {
    super(model);
  }
}
