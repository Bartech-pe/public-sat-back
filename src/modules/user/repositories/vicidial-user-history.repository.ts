import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { VicidialUserHistory } from '../entities/vicidial-user-history.model';

@Injectable()
export class VicidialUserHistoryRepository extends GenericCrudRepository<VicidialUserHistory> {
  constructor(
    @InjectModel(VicidialUserHistory)
    model: typeof VicidialUserHistory,
  ) {
    super(model);
  }
}
