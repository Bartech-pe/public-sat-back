import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { TypeIdeDoc } from '../entities/type-ide-doc.entity';

/**
 * Repository for TypeIdeDoc entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to TypeIdeDoc in the future.
 */
@Injectable()
export class TypeIdeDocRepository extends GenericCrudRepository<TypeIdeDoc> {
  constructor(
    @InjectModel(TypeIdeDoc)
    model: typeof TypeIdeDoc,
  ) {
    super(model);
  }
}
