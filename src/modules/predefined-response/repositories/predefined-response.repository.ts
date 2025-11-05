import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { PredefinedResponse } from '../entities/predefined-response.entity';

@Injectable()
export class PredefinedResponseRepository extends GenericCrudRepository<PredefinedResponse> {
  constructor(
    @InjectModel(PredefinedResponse)
    model: typeof PredefinedResponse,
  ) {
    super(model);
  }
}
