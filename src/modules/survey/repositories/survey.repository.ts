import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Survey } from '../entities/survey.entity';

@Injectable()
export class SurveyRepository extends GenericCrudRepository<Survey> {
  constructor(
    @InjectModel(Survey)
    model: typeof Survey,
  ) {
    super(model);
  }
}
