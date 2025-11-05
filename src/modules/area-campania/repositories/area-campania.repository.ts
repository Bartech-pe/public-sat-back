import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AreaCampaniaResponse } from '../entities/area-campania.entity';

@Injectable()
export class AreaCampaniaRepository extends GenericCrudRepository<AreaCampaniaResponse> {
  constructor(
    @InjectModel(AreaCampaniaResponse)
    model: typeof AreaCampaniaResponse,
  ) {
      super(model);
  }
}