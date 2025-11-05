import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CaseInformation } from '../entities/case-information.entity';

@Injectable()
export class CaseInformationRepository extends GenericCrudRepository<CaseInformation> {
  constructor(
    @InjectModel(CaseInformation)
    model: typeof CaseInformation,
  ) {
    super(model);
  }
}
