import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CarteraDetalle } from '../entities/cartera-detalle.entity';

@Injectable()
export class CarteraDetalleRepository extends GenericCrudRepository<CarteraDetalle> {
  constructor(
    @InjectModel(CarteraDetalle)
    model: typeof CarteraDetalle,
  ) {
    super(model);
  }
}
