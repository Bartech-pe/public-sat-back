import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { GestionCampaniaResponse } from '../entities/gestion-campania.entity';

@Injectable()
export class GestionCampaniaRepository extends GenericCrudRepository<GestionCampaniaResponse> {
  constructor(
    @InjectModel(GestionCampaniaResponse)
    model: typeof GestionCampaniaResponse,
  ) {
      super(model);
  }
}