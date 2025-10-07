import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChatRoom } from '../entities/chat-room.entity';

@Injectable()
export class ChatRoomRepository extends GenericCrudRepository<ChatRoom> {
  constructor(
    @InjectModel(ChatRoom)
    model: typeof ChatRoom,
  ) {
    super(model);
  }
}
