import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Oficina } from '../entities/oficina.entity';

@Injectable()
export class OficinaRepository extends GenericCrudRepository<Oficina> {
  constructor(
    @InjectModel(Oficina)
    model: typeof Oficina,
  ) {
    super(model);
  }
}
