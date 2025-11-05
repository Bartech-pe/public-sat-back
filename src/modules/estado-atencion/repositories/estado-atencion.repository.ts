import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EstadoAtencion } from '../entities/estado-atencion.entity';


@Injectable()
export class EstadoAtencionRepository extends GenericCrudRepository<EstadoAtencion> {
  constructor(
    @InjectModel(EstadoAtencion)
    model: typeof EstadoAtencion,
  ) {
      super(model);
  }
}
