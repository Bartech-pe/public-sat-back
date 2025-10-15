import { IncomingMessage } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  forwardRef,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { ChannelRoomRepository } from './repositories/channel-room.repository';
import { ChannelMessageRepository } from './repositories/channel-messages.repository';
import {
  ChannelType,
  MessageType,
} from '@common/interfaces/channel-connector/messaging.interface';
import { ChannelCitizen } from './entities/channel-citizen.entity';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { InboxCredentialRepository } from '@modules/inbox/repositories/inbox-credential.repository';
import { CreateChannelRoomDto } from './dto/create-channel-room.dto';
import { ChannelMessage } from './entities/channel-message.entity';
import { CreateChannelMessageDto } from './dto/channel-message/create-channel-message.dto';
import { ChannelRoom } from './entities/channel-room.entity';
import { OutgoingPayload } from '@common/interfaces/channel-connector/outgoing/outgoing.interface';
import { MultiChannelChatGateway } from './multi-channel-chat.gateway';
import {
  ChannelRoomNewMessageDto,
  MessageAttachment,
} from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import {
  BufferedMessage,
  MessageBufferService,
} from './services/message-buffer.service';
import { BasicInfoService } from './services/basic-info.service';
import { ChannelAttentionRepository } from './repositories/channel-attention.repository';
import { CreateAssistanceDto } from './dto/channel-attentions/create-assistance.dto';
import {
  ChannelAttention,
  ChannelAttentionStatus,
} from './entities/channel-attention.entity';
import { ChannelCitizenService } from './services/channel-citizen.service';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { col, fn, Op } from 'sequelize';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { InboxCredential } from '@modules/inbox/entities/inbox-credential.entity';
import { ChannelMessageAttachmentRepository } from './repositories/channel-message-attachments.repository';
import { channelConnectorConfig, jwtConfig } from 'config/env';
import { UserRepository } from '@modules/user/repositories/user.repository';
import {
  roleIdAdministrador,
  roleIdSupervisor,
} from '@common/constants/role.constant';
import { JwtService } from '@nestjs/jwt';

export interface IChannelChatInformation {
  channelRoomId?: number | null;
  assistanceId?: number | null;
  userId?: number | null;
  channelCitizenId?: number | null;
  error?: string | null;
  registered?: boolean;
}

@Injectable()
export class MultiChannelChatService implements OnModuleInit, OnModuleDestroy {
  private socket: Socket;
  private readonly logger = new Logger(MultiChannelChatService.name);
  constructor(
    @Inject(forwardRef(() => BasicInfoService))
    private basicInfoService: BasicInfoService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private multiChannelChatGateway: MultiChannelChatGateway,
    @Inject(forwardRef(() => ChannelCitizenService))
    private channelCitizenService: ChannelCitizenService,
    @Inject(forwardRef(() => MessageBufferService))
    private messageBufferService: MessageBufferService,
    private channelMessageAttachmentRepository: ChannelMessageAttachmentRepository,
    private inboxUserRepository: InboxUserRepository,
    private inboxCredentialRepository: InboxCredentialRepository,
    private channelRoomRepository: ChannelRoomRepository,
    private userRepository: UserRepository,
    private channelMessageRepository: ChannelMessageRepository,
    private readonly jwtService: JwtService,
    private ChannelAttentionRepository: ChannelAttentionRepository,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    ((this.socket = io(channelConnectorConfig.baseUrl, {
      auth: {
        token: channelConnectorConfig.verifyToken,
      },
    })),
      {
        transports: ['websocket'],
      });

    this.socket.on('connect', () => {
      this.logger.log(
        `Conectado a Socket.IO en ${channelConnectorConfig.baseUrl}`,
      );
    });

    this.socket.on(
      'chat.status.typing.indicator',
      async (data: IChannelChatInformation) => {
        try {
          this.socket.emit('chat.status.typing.indicator', data);
        } catch (error) {
          this.logger.error('Error', error);
        }
      },
    );

    this.socket.on(
      'message.incoming',
      async (
        data: IncomingMessage,
        callback: (payload: IChannelChatInformation) => {},
      ) => {
        let result: IChannelChatInformation = {
          registered: false,
          error: '',
          assistanceId: null,
          channelCitizenId: null,
          channelRoomId: null,
          userId: null,
        };
        try {
          if (data.type !== MessageType.INCOMING) return null;

          if (data.payload.channel == ChannelType.CHATSAT) {
            this.logger.debug(data);
            const isValidToken = await this.checkCitizenToken(data?.token);
            if (!isValidToken) {
              result.error = 'No autorizado.';
              if (typeof callback === 'function') {
                callback(result);
              }
              return;
            }
          }

          const citizen =
            await this.channelCitizenService.createCitizenFromMessage(data);
          const channelRoom = await this.createChannelRoom(
            data,
            citizen?.id as number,
          );
          const assistance = await this.createAssistance(
            channelRoom.dataValues.id,
            data.payload.channel == ChannelType.WHATSAPP,
          );
          const channelMessage = await this.createChannelMessage({
            assistanceId: assistance.id,
            channelRoomId: channelRoom.dataValues.id,
            content: data.payload.message.body ?? '',
            senderType: 'citizen',
            status: 'unread',
            timestamp: new Date(),
            userId: channelRoom.dataValues.userId as number,
            externalChannelRoomId: data.payload.chat_id as number,
            externalMessageId: data.payload.message.id as string,
          });
          let attachments: MessageAttachment[] = [];

          if (data.payload.attachments) {
            for (const element of data.payload.attachments) {
              const size = this.base64FileSize(element.content ?? '');
              const newAttachment =
                await this.channelMessageAttachmentRepository.create({
                  type: element.type,
                  content: element.content ?? '',
                  name: element.name,
                  channelMessageId: channelMessage.dataValues.id,
                  size: size,
                  extension: element.extension ?? '',
                });

              let attachment = newAttachment.toJSON();
              attachments.push({
                id: attachment.id,
                type: attachment.type,
                content: attachment.content,
                name: attachment.name!,
                size: size,
                extension: attachment.extension,
              });
            }
          }
          let channelRoomParsed = channelRoom.toJSON();
          let channelMessageParsed = channelMessage.toJSON();

          let countUnreadMessages =
            await this.channelMessageRepository.findAndCountAll({
              where: {
                channelRoomId: channelRoomParsed.id,
                status: 'unread',
                senderType: 'citizen',
              },
            });
          if (!channelRoomParsed.userId) return;

          let channelUser = await this.userRepository.findById(
            channelRoomParsed.userId,
          );

          let newMessage: ChannelRoomNewMessageDto = {
            channelRoomId: channelRoomParsed.id,
            attention: {
              id: assistance.id,
            },
            externalRoomId: channelRoomParsed.externalChannelRoomId,
            channel: data.payload.channel,
            advisor: {
              id: channelUser.dataValues.id,
              name: channelUser.dataValues.name,
            },
            status: channelRoomParsed.status,
            message: {
              sender: {
                id: citizen.id,
                externalUserId: citizen.externalUserId || '',
                fullName: citizen.fullName || '',
                phone: citizen.phoneNumber,
                avatar: citizen.avatarUrl || '',
                alias: citizen.name,
                fromCitizen: true,
                isAgent: false,
                documentNumber: citizen?.documentNumber,
                documentType: citizen?.documentType,
              },
              attachments: attachments,
              id: channelMessageParsed.id,
              externalMessageId: channelMessageParsed.externalMessageId,
              message: channelMessageParsed.content,
              status: channelMessageParsed.status,
              time: new Date(channelMessageParsed.timestamp).toLocaleTimeString(
                'es-PE',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              ),
              fromMe: false,
            },
            unreadCount: countUnreadMessages.total as number,
            botStatus: channelRoomParsed.botReplies ? 'active' : 'paused',
          };
          this.multiChannelChatGateway.handleNewMessage(newMessage);
          let inboxCredential: InboxCredential[] =
            await this.inboxCredentialRepository.findAll({
              where: { inboxId: channelRoom.dataValues.inboxId },
              order: [['createdAt', 'DESC']],
              limit: 1,
            });
          let credentials = inboxCredential[0].toJSON() as InboxCredential;
          const bufferedMessage: BufferedMessage = {
            data,
            assistance: assistance,
            citizen: citizen as ChannelCitizen,
            channelRoom: channelRoom.toJSON(),
            user: channelUser,
            credentials,
            externalMessageId: channelMessageParsed.externalMessageId,
          };

          let needVerify = false;
          if (!data.payload.message.body) return;

          if (
            data.payload.channel !== ChannelType.CHATSAT &&
            assistance.status === ChannelAttentionStatus.IDENTITY_VERIFICATION
          ) {
            const { handled } =
              await this.basicInfoService.handleBasicInfoMessage(
                bufferedMessage,
              );
            needVerify = handled;
          }
          if (
            data.payload.channel == ChannelType.CHATSAT ||
            (!needVerify &&
              assistance.status !==
                ChannelAttentionStatus.IDENTITY_VERIFICATION)
          ) {
            await this.messageBufferService.addMessageToBuffer(bufferedMessage);
          }

          result = {
            registered: true,
            assistanceId: assistance.id,
            channelRoomId: channelRoom.dataValues.id,
            channelCitizenId: citizen.id,
            userId: channelRoom.dataValues.userId,
          };
          if (typeof callback === 'function') {
            this.logger.debug(result);
            callback(result);
          }
        } catch (error) {
          if (typeof callback === 'function') {
            callback(result);
          }
          this.logger.error('Mensaje no enviado', error);
        }
      },
    );

    this.socket.on('disconnect', () => {
      this.logger.warn('Desconectado de Socket.IO');
    });

    this.socket.on('connect_error', (err) => {
      this.logger.error('Error de conexión a Socket.IO:', err.message);
    });
  }

  public delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async checkCitizenToken(token?: string): Promise<boolean> {
    if (!token || !token.startsWith('Bearer ')) {
      return false;
    }
    const cleanToken = token.split(' ')[1];

    try {
      const reponse = await this.jwtService.verifyAsync(cleanToken, {
        secret: jwtConfig.secretCitizen,
      });

      return !!reponse;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  handleChatCompletedEvent(payload: IChannelChatInformation) {
    try {
      this.socket.emit('chat.status.completed', payload);
    } catch (error) {
      this.logger.error('handleChatCompletedEventError: ', error);
    }
  }

  handleTypingIndicator(payload: IChannelChatInformation) {
    try {
      this.socket.emit('chat.status.typing.indicator', payload);
    } catch (error) {
      this.logger.error('handleChatCompletedEventError: ', error);
    }
  }

  public sendMessageToExternal(payload: OutgoingPayload): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.socket.emit('message.outgoing', payload, (response: any) => {
          console.log(
            'Respuesta de socket.emit:',
            response,
            'Mensaje:',
            payload.message,
          );
          resolve(response);
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  private disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private async searchAdvisorAvailable(inboxId?: number): Promise<number> {
    const inboxUsers: InboxUser[] = await this.inboxUserRepository.findAll({
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          include: [
            {
              model: Role,
              required: true,
              where: {
                id: { [Op.notIn]: [roleIdAdministrador, roleIdSupervisor] },
              },
            },
          ],
        },
      ],
      where: { inboxId: inboxId },
    });

    const agents = inboxUsers.map((x) => x.dataValues.userId);

    if (agents.length === 0) {
      throw new Error('No hay agentes disponibles para asignar el channelRoom');
    }

    const activeCounts = await this.ChannelAttentionRepository.findAll({
      attributes: [
        [col('channelRoom.user_id'), 'user_id'], // 👈 usa el alias correcto
        [fn('COUNT', col('ChannelAttention.id')), 'activeCount'],
      ],
      where: { status: { [Op.not]: ChannelAttentionStatus.CLOSED } },
      include: [
        {
          model: ChannelRoom,
          as: 'channelRoom', // 👈 fuerza el alias
          attributes: [],
          required: true,
          where: { userId: { [Op.in]: agents } },
        },
      ],
      group: ['channelRoom.user_id'], // 👈 igual aquí
      raw: true,
      subQuery: false,
    });

    const roomCounts = new Map<number, number>(agents.map((id) => [id, 0]));

    for (const row of activeCounts) {
      const userId = Number((row as any).userId);
      const activeCount = Number((row as any).activeCount) || 0;
      roomCounts.set(userId, activeCount);
    }

    let minCount = Infinity;
    for (const c of roomCounts.values()) {
      if (c < minCount) minCount = c;
    }
    const candidates = [...roomCounts.entries()]
      .filter(([, c]) => c === minCount)
      .map(([u]) => u);
    if (candidates.length === 0) {
      return agents[0];
    }

    const selectedUserId =
      candidates[Math.floor(Math.random() * candidates.length)];
    return selectedUserId;
  }

  private async createChannelRoom(
    newMessage: IncomingMessage,
    channelCitizenId: number,
  ): Promise<ChannelRoom> {
    const message = newMessage.payload;
    console.log(newMessage);

    let inboxCredential: InboxCredential | null =
      await this.inboxCredentialRepository.findOne({
        include: [
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: Channel,
                required: true,
                where: { name: newMessage.payload.channel },
              },
            ],
          },
        ],
        ...(newMessage.payload.channel === ChannelType.CHATSAT
          ? { where: { accessToken: newMessage.payload.token } }
          : {
              where: {
                phoneNumber: newMessage?.payload?.receiver?.phone_number,
              },
            }),
        order: [['createdAt', 'DESC']],
        limit: 1,
        throwIfNotFound: false,
      });

    if (!inboxCredential) {
      this.logger.error('No se encontraron las credenciales para este canal');
    }
    let selectedUserId: number | undefined = await this.searchAdvisorAvailable(
      inboxCredential?.dataValues?.inboxId,
    );

    if (!selectedUserId) {
      this.logger.error('No se pudo asignar un agente al channelRoom');
    }

    let channelRoomExists: ChannelRoom[] =
      await this.channelRoomRepository.findAll({
        include: [
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: Channel,
                required: true,
                where: { name: newMessage.payload.channel },
              },
            ],
          },
        ],
        where: { channelCitizenId: channelCitizenId },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

    if (channelRoomExists.length) {
      const attentions = await this.ChannelAttentionRepository.findAll({
        where: {
          channelRoomId: channelRoomExists[0].dataValues.id,
          status: ChannelAttentionStatus.IN_PROGRESS,
        },
      });

      if (
        channelRoomExists[0].dataValues.status == 'completado' ||
        (channelRoomExists[0].dataValues.status == 'completado' &&
          attentions.length > 0)
      ) {
        const [_, [updatedRoom]] = await this.channelRoomRepository.update(
          channelRoomExists[0].dataValues.id,
          {
            status: 'pendiente',
            userId: selectedUserId,
          },
        );
        this.logger.debug('diavlo: ', updatedRoom);
        return updatedRoom;
      }
      return channelRoomExists[0];
    }

    const channelRoomDto: CreateChannelRoomDto = {
      userId: selectedUserId,
      channelCitizenId: channelCitizenId,
      botReplies: true,
      status: 'pendiente',
      externalChannelRoomId: message.chat_id.toString(),
      inboxId: inboxCredential?.dataValues?.inboxId!,
    };

    return this.channelRoomRepository.create(channelRoomDto);
  }

  public async createChannelMessage(
    payload: CreateChannelMessageDto,
  ): Promise<ChannelMessage> {
    return await this.channelMessageRepository.create(payload);
  }

  private async createAssistance(
    channelRoomId: number,
    needVerify: boolean,
  ): Promise<ChannelAttention> {
    const assistanceCreated = await this.ChannelAttentionRepository.findOne({
      where: {
        channelRoomId: channelRoomId,
        endDate: null,
        status: { [Op.not]: ChannelAttentionStatus.CLOSED },
      },
      order: [['createdAt', 'DESC']],
      limit: 1,
    });
    if (!assistanceCreated) {
      let assistTicket: CreateAssistanceDto = {
        channelRoomId: channelRoomId,
        startDate: new Date(),
        status: needVerify
          ? ChannelAttentionStatus.IDENTITY_VERIFICATION
          : ChannelAttentionStatus.IN_PROGRESS,
      };

      return (
        await this.ChannelAttentionRepository.create(assistTicket)
      ).toJSON();
    }
    return assistanceCreated.toJSON();
  }

  broadcastMessage(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      this.logger.warn('Socket no conectado. No se puede emitir mensaje.');
    }
  }

  base64FileSize(base64String: string): number {
    if (!base64String) return 0;
    const cleaned = base64String.split(';base64,').pop() || base64String;
    const sizeInBytes =
      (cleaned.length * 3) / 4 -
      (cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0);
    return sizeInBytes;
  }
}
