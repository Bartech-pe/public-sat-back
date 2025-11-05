import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EstadoCampania } from '../entities/estado-campania.entity';

@Injectable()
export class EstadoCampaniaRepository extends GenericCrudRepository<EstadoCampania> {
  constructor(
    @InjectModel(EstadoCampania)
    model: typeof EstadoCampania,
  ) {
      super(model);
  }
}
