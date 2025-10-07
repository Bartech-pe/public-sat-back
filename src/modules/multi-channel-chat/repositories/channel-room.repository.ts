import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelRoom } from '../entities/channel-room.entity';

@Injectable()
export class ChannelRoomRepository extends GenericCrudRepository<ChannelRoom> {
  constructor(
	@InjectModel(ChannelRoom)
	model: typeof ChannelRoom,
  ) {
	super(model);
  }
}
