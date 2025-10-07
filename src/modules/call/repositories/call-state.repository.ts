import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CallState } from '../entities/call-state.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CallStateRepository extends GenericCrudRepository<CallState> {
  constructor(
    @InjectModel(CallState)
    model: typeof CallState,
  ) {
    super(model);
  }
}
