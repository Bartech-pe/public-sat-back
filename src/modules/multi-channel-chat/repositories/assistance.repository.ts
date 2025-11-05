import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Assistance } from '../entities/assistance.entity';
import { CountOptions } from 'sequelize';

@Injectable()
export class AssistanceRepository extends GenericCrudRepository<Assistance> {
  constructor(
	@InjectModel(Assistance)
	model: typeof Assistance,
  ) {
	super(model);
  }
   async count(options?: Omit<CountOptions<{}>, 'group'>) {
          return await this.model.count(options);
  }
}
