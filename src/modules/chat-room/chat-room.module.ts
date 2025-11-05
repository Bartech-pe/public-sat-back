import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { ChatRoomGateway } from './gateways/chat-room.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatRoom } from './entities/chat-room.entity';
import { UserChatRoom } from './entities/user-chat-room.entity';
import { Message } from './entities/message.entity';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { UserChatRoomRepository } from './repositories/user-chat-room.repository';
import { MessageRepository } from './repositories/message.repository';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([ChatRoom, UserChatRoom, Message]),
    UserModule,
  ],
  controllers: [ChatRoomController],
  providers: [
    ChatRoomService,
    ChatRoomGateway,
    ChatRoomRepository,
    UserChatRoomRepository,
    MessageRepository,
  ],
  exports: [ChatRoomRepository, UserChatRoomRepository, MessageRepository],
})
export class ChatRoomModule {}
