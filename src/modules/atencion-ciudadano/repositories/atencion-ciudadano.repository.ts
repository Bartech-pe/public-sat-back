import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AtencionCiudadano } from '../entities/atencion-ciudadano.entity';

@Injectable()
export class AtencionCiudadanoRepository extends GenericCrudRepository<AtencionCiudadano> {
  constructor(
    @InjectModel(AtencionCiudadano)
    model: typeof AtencionCiudadano,
  ) {
    super(model);
  }
}
