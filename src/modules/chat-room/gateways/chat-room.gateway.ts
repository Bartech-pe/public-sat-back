import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from '../chat-room.service';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { JwtWsGuard } from '@common/guards/jwt-ws.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatRoomGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatRoomService) {}

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @CurrentUser() user: User,
    @MessageBody() data: { chatRoomId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = user.id; // tu lógica de auth

    const message = await this.chatService.createMessage(
      userId,
      data.chatRoomId,
      data.content,
    );

    this.server.to(`room-${data.chatRoomId}`).emit('newMessage', message);
  }

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { chatRoomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room-${data.chatRoomId}`);
  }
}
