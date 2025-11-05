import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelQueryHistory } from '../entities/channel-query-history.entity';

@Injectable()
export class ChannelQueryHistoryRepository extends GenericCrudRepository<ChannelQueryHistory> {
  constructor(
	@InjectModel(ChannelQueryHistory)
	model: typeof ChannelQueryHistory,
  ) {
	super(model);
  }
}
