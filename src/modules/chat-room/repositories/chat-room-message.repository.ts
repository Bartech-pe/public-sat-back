import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChatRoomMessage } from '../entities/chat-room-message.entity';

@Injectable()
export class ChatRoomMessageRepository extends GenericCrudRepository<ChatRoomMessage> {
  constructor(
    @InjectModel(ChatRoomMessage)
    model: typeof ChatRoomMessage,
  ) {
    super(model);
  }
}
