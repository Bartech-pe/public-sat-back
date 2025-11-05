import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EstadoCanal } from '../entities/estado-canal.entity';

@Injectable()
export class EstadoCanalRepository extends GenericCrudRepository<EstadoCanal> {
  constructor(
    @InjectModel(EstadoCanal)
    model: typeof EstadoCanal,
  ) {
      super(model);
  }
  async findAvalibleEmail(){
    return await this.model.findOne<EstadoCanal>({ where: { id: 12 } });
  }
  async findDisableEmail(){
    return await this.model.findOne<EstadoCanal>({ where: { id:13} });
  }
  
}
