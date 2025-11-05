import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Cartera } from '../entities/cartera.entity';

@Injectable()
export class CarteraRepository extends GenericCrudRepository<Cartera> {
  constructor(
    @InjectModel(Cartera)
    model: typeof Cartera,
  ) {
    super(model);
  }
}
