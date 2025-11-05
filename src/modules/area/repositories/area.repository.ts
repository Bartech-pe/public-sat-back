import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Area } from '../entities/area.entity';

@Injectable()
export class AreaRepository extends GenericCrudRepository<Area> {
  constructor(
    @InjectModel(Area)
    model: typeof Area,
  ) {
    super(model);
  }
}
