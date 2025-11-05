import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InformacionCaso } from '../entities/informacion-caso.entity';

@Injectable()
export class InformacionCasoRepository extends GenericCrudRepository<InformacionCaso> {
  constructor(
    @InjectModel(InformacionCaso)
    model: typeof InformacionCaso,
  ) {
    super(model);
  }
}
