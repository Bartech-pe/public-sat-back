import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { UserChatRoom } from '../entities/user-chat-room.entity';

@Injectable()
export class UserChatRoomRepository extends GenericCrudRepository<UserChatRoom> {
  constructor(
    @InjectModel(UserChatRoom)
    model: typeof UserChatRoom,
  ) {
    super(model);
  }
}
