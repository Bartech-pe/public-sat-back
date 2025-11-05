import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Citizen } from '../entities/citizen.entity';

/**
 * Repository for Citizen entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Citizen in the future.
 */
@Injectable()
export class CitizenRepository extends GenericCrudRepository<Citizen> {
  constructor(
    @InjectModel(Citizen)
    model: typeof Citizen,
  ) {
    super(model);
  }
}
