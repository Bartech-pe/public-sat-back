import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AsignarCartera } from '../entities/asignar-cartera.entity';

@Injectable()
export class AsignarCarteraRepository extends GenericCrudRepository<AsignarCartera> {
  constructor(
    @InjectModel(AsignarCartera)
    model: typeof AsignarCartera,
  ) {
    super(model);
  }
}