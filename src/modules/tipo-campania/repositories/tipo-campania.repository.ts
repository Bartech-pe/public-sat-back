import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { TipoCampaniaResponse } from '../entities/tipo-campania.entity';

@Injectable()
export class TipoCampaniaRepository extends GenericCrudRepository<TipoCampaniaResponse> {
  constructor(
    @InjectModel(TipoCampaniaResponse)
    model: typeof TipoCampaniaResponse,
  ) {
      super(model);
  }
  async getSMS(){
    return await this.findOne({where:{name:'SMS'}})
  }
}