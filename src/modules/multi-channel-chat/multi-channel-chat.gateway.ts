import {
  ChannelRoomNewMessageDto,
  ChannelRoomViewStatusDto,
} from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChannelRoomService } from './services/channel-room.service';
import { AdvisorChangedDto } from './dto/channel-advisors/channel-advisor-changed.dto';
import { BotStatusChangedDto } from './dto/channel-room/bot-status-changed.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { ChannelCitizenService } from './services/channel-citizen.service';
import { changeChannelRoomStatusDto } from './dto/channel-room/change-channel-room-status.dto';
import { MultiChannelChatService } from './multi-channel-chat.service';
import { forwardRef, Inject } from '@nestjs/common';

export interface ChannelRoomAssistance {
  channelRoomId: number;
  assistanceId: number;
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MultiChannelChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private channelCitizenService: ChannelCitizenService,
    private channelRoomService: ChannelRoomService,
    @Inject(forwardRef(() => MultiChannelChatService))
    private multiChannelService: MultiChannelChatService,
  ) {}

  async handleConnection(client: any) {
    try {
      const token = client.handshake?.headers?.authorization?.split(' ')[1];
      if (token) {
        const payload = this.jwtService.verify(token);
        const user = await this.userRepository.findById(payload.sub, {
          include: [{ model: Role }],
        });
        client.user = user;
      }
    } catch (err) {
      console.error('Error autenticando socket:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    console.log('server NO Listo');
  }
  afterInit(server: any) {
    console.log('serverListo');
  }

  handleNewMessage(newMessage: ChannelRoomNewMessageDto) {
    this.server.emit('message.incoming', newMessage);
  }

  notifyChatViewedStatus(payload: ChannelRoomViewStatusDto) {
    this.server.emit('chat.viewed.reply', payload);
  }

  notifyAdvisorChanged(payload: AdvisorChangedDto) {
    this.server.emit('chat.advisor.change', payload);
  }

  notifyBotStatusChanged(payload: BotStatusChangedDto) {
    this.server.emit('chat.botStatus.change', payload);
  }

  notifyAssistanceClosed(assistanceId: number) {
    this.server.emit('chat.assistance.close', assistanceId);
  }

  notifyChannelRoomStatusChanged(payload: changeChannelRoomStatusDto) {
    this.server.emit('chat.status.change', payload);
  }

  notifyAdvisorRequest(
    channelRoomId: number,
    assistanceId: number,
    userId: number,
  ) {
    this.server.emit('chat.advisor.request', {
      channelRoomId,
      assistanceId,
      userId,
    });
  }

  @SubscribeMessage('chat.viewed')
  handleChatViewed(
    @ConnectedSocket() client: any,
    @MessageBody() channelRoomId: number,
  ) {
    const user = client.user as User;
    console.log('Usuario actual:', user);
    this.channelRoomService.handleChatViewed(channelRoomId, user);
  }

  @SubscribeMessage('chat.status.typing.indicator')
  handleTypingIndicator(@MessageBody() payload: ChannelRoomAssistance) {
    this.multiChannelService.handleTypingIndicator(payload);
  }

  @SubscribeMessage('chat.advisor.request')
  handleRequestAdvisor(
    @ConnectedSocket() client: any,
    @MessageBody() phoneNumber: string,
  ) {
    const user = client.user as User;
    console.log('Usuario actual:', user);
    this.channelCitizenService.requestAdvisor(phoneNumber);
  }
  // @SubscribeMessage('chat.advisor.request')
  // handleRequestAdvisor(@MessageBody() phoneNumber: string) {
  //   this.channelRoomService.requestAdvisor(phoneNumber);
  // }
}
