import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Citizen } from '../entities/citizen.entity';

@Injectable()
export class CitizenRepository extends GenericCrudRepository<Citizen> {
  constructor(
	@InjectModel(Citizen)
	model: typeof Citizen,
  ) {
	super(model);
  }
}
