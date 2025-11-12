import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CitizenAssistance } from '../entities/citizen-assistance.entity';

@Injectable()
export class CitizenAssistanceRepository extends GenericCrudRepository<CitizenAssistance> {
  constructor(
    @InjectModel(CitizenAssistance)
    model: typeof CitizenAssistance,
  ) {
    super(model);
  }
}
