import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelStateUserHistory } from '../entities/channel-state-user-history.model';

@Injectable()
export class ChannelStateUserHistoryRepository extends GenericCrudRepository<ChannelStateUserHistory> {
  constructor(
    @InjectModel(ChannelStateUserHistory)
    model: typeof ChannelStateUserHistory,
  ) {
    super(model);
  }
}
