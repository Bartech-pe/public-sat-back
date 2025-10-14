import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ChannelRoomRepository } from '../repositories/channel-room.repository';
import {
  ChannelRoomNewMessageDto,
  ChannelRoomSummaryDto,
  ChannelRoomViewStatusDto,
  MessageAttachment,
} from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { ChannelMessageRepository } from '../repositories/channel-messages.repository';
import { ChannelCitizen } from '../entities/channel-citizen.entity';
import { ChannelMessage } from '../entities/channel-message.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  ChannelChatDetail,
  ChannelRoomMessage,
  Channels,
  CitizenDocType,
} from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { MultiChannelChatService } from '../multi-channel-chat.service';
import { CreateChannelAgentMessageDto } from '../dto/channel-message/create-message-from-agent.dto';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { MultiChannelChatGateway } from '../multi-channel-chat.gateway';
import {
  MessagingCredentials,
  OutgoingPayload,
} from '@common/interfaces/channel-connector/outgoing/outgoing.interface';
import { ToogleBotServicesDto } from '../dto/channel-room/toggle-bot-services.dto';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { AdvisorsResponseDto } from '../dto/channel-advisors/get-advisors.dto';
import { Response } from 'express';
import { GetChannelSummaryDto } from '../dto/channel-summary/get-channel-summary.dto';
import { Op } from 'sequelize';
import { changeChannelRoomStatusDto } from '../dto/channel-room/change-channel-room-status.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import {
  ChannelAttention,
  ChannelAttentionStatus,
} from '../entities/channel-attention.entity';
import { ChannelAttentionRepository } from '../repositories/channel-attention.repository';
import { ChannelRoom } from '../entities/channel-room.entity';
import { ChannelAttentionService } from './channel-attention.service';
import { CloseChannelAttentionDto } from '../dto/channel-attentions/close-assistance.dto';
import { InboxCredential } from '@modules/inbox/entities/inbox-credential.entity';
import { UpdateCitizenBasicInformationDto } from '../dto/channel-room/update-citizen-basic-info.dto';
import { ChannelMessageAttachment } from '../entities/channel-message-attachments.entity';
import { ChannelMessageAttachmentRepository } from '../repositories/channel-message-attachments.repository';
import { Attachment } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import { ChannelCitizenRepository } from '../repositories/channel-citizen.repository';
import {
  roleIdAdministrador,
  roleIdSupervisor,
} from '@common/constants/role.constant';

@Injectable()
export class ChannelRoomService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChannelRoomService.name);

  constructor(
    @Inject(forwardRef(() => MultiChannelChatService))
    private multiChannelService: MultiChannelChatService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private multiChannelChatGateway: MultiChannelChatGateway,
    private channelRoomRepository: ChannelRoomRepository,
    private assistanceRepository: ChannelAttentionRepository,
    private citizenRepository: ChannelCitizenRepository,
    private assistanceService: ChannelAttentionService,
    private channelMessageRepository: ChannelMessageRepository,
    private channelMessageAttachmentRepository: ChannelMessageAttachmentRepository,
    private inboxUserRepository: InboxUserRepository,
  ) {}

  async getRoomSummaries(
    query: GetChannelSummaryDto,
    user: User,
  ): Promise<ChannelRoomSummaryDto[]> {
    const currentUserRole = user.role;
    const currentUserInboxes = await this.inboxUserRepository.findAll({
      where: { userId: user.id },
    });

    const inboxes = currentUserInboxes.map((x) => x.dataValues.inboxId);

    const assistances = await this.assistanceRepository.findAll({
      ...(query.chatStatus === 'completado'
        ? {
            where: {
              status: { [Op.eq]: ChannelAttentionStatus.CLOSED },
              endDate: { [Op.not]: null },
            },
          }
        : {
            where: {
              status: { [Op.not]: ChannelAttentionStatus.CLOSED },
              endDate: { [Op.is]: null },
            },
          }),
      order: [['startDate', 'DESC']],
      include: [
        {
          model: ChannelRoom,
          required: true,
          where:
            currentUserRole.name !== 'administrador'
              ? {
                  userId: user.id,
                  ...(query.chatStatus ? { status: query.chatStatus } : {}),
                }
              : query.chatStatus
              ? { status: query.chatStatus }
              : {},
          include: [
            {
              model: ChannelCitizen,
              required: true,
              ...(query.search
                ? { where: { name: { [Op.like]: `%${query.search}%` } } }
                : {}),
              attributes: ['id', 'name', 'fullName', 'avatarUrl', 'phoneNumber'],
            },
            {
              model: User,
              as: 'user',
              required: true,
              attributes: ['id', 'name', 'displayName', 'avatarUrl'],
            },
            {
              model: Inbox,
              required: true,
              ...(currentUserRole.name !== 'administrador'
                ? { where: { id: inboxes } }
                : {}),
              include: [
                {
                  model: Channel,
                  required: true,
                  attributes: ['name', 'logo'],
                  ...(query.channel !== 'all'
                    ? { where: { name: query.channel } }
                    : {}),
                },
              ],
            },
          ],
        },
        {
          model: ChannelMessage,
          required: false,
          separate: true,
          include: [
            {
              model: ChannelMessageAttachment,
              required: false,
            },
          ],
          order: [['timestamp', 'DESC']],
          limit: 1,
        },
      ],
    });

    const result: ChannelRoomSummaryDto[] = [];

    for (const assistance of assistances) {
      const assistanceData = assistance.toJSON();
      const channelRoom = assistance.get('channelRoom') as ChannelRoom;
      const chatroom = channelRoom?.toJSON();
      const inbox = channelRoom?.get('inbox') as Inbox;
      const channel = inbox?.get('channel')?.toJSON() as Channel;
      const messages = assistance?.get('messages')[0] as ChannelMessage;
      const lastMessage = !messages ? null : messages.toJSON();
      const citizen = channelRoom?.get('citizen')?.toJSON() as ChannelCitizen;
      const advisor = channelRoom?.get('user')?.toJSON() as User;

      // ✅ Validaciones: sin mensaje, o asesor distinto (solo si no es admin)
      if (!lastMessage) continue;
      if (currentUserRole.name !== 'administrador' && chatroom?.userId !== user.id) continue;

      const unreadCount = await this.channelMessageRepository.findAndCountAll({
        where: {
          assistanceId: assistance.id,
          status: 'unread',
          senderType: 'citizen',
        },
      });

      result.push({
        channelRoomId: chatroom?.id,
        assistanceId: assistanceData.id,
        externalRoomId: chatroom?.externalChannelRoomId,
        channel: channel?.name,
        status: chatroom?.status,
        advisor: {
          id: advisor?.id,
          name: advisor?.displayName || advisor?.name || 'Unknown',
        },
        lastMessage: {
          citizen: {
            id: citizen?.id,
            name: citizen?.name ?? '',
            fullName: citizen?.fullName ?? '',
            avatar: citizen?.avatarUrl || '',
            phone: citizen?.phoneNumber,
          },
          externalMessageId: lastMessage?.externalMessageId,
          id: lastMessage?.id,
          message: lastMessage?.content,
          status: lastMessage?.status,
          time: new Date(lastMessage?.timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: new Date(lastMessage?.timestamp).getTime(),
          fromMe: lastMessage?.senderType !== 'citizen',
        },
        unreadCount: unreadCount.total as number,
        botStatus: chatroom?.botReplies ? 'active' : 'paused',
      });
    }

    // 🧩 Orden base por timestamp
    if (result.length) {
      result.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    }

    // 🧠 NUEVA LÓGICA DE FILTRADO FINAL
    /**
     * Reglas:
     * 1️⃣ Si chatStatus está definido → filtra por él, ignorando messageStatus.
     * 2️⃣ Si no hay chatStatus pero sí messageStatus → filtra por messageStatus.
     * 3️⃣ Si no hay ninguno → mostrar unread y prioridad (prioridad primero).
     */

    // 1️⃣ chatStatus explícito
    if (query.chatStatus) {
      return result.filter((ch) => ch.status === query.chatStatus);
    }

    // 2️⃣ Solo messageStatus
    if (!query.chatStatus && query.messageStatus) {
      return result.filter((ch) => ch.lastMessage.status === query.messageStatus);
    }

    // 3️⃣ Estado inicial → unread + prioridad
    const filtered = result.filter(
      (ch) => ch.lastMessage.status === 'unread' || ch.status === 'prioridad',
    );

    // 🏁 Prioridad primero, luego timestamp
    filtered.sort((a, b) => {
      if (a.status === 'prioridad' && b.status !== 'prioridad') return -1;
      if (b.status === 'prioridad' && a.status !== 'prioridad') return 1;
      return b.lastMessage.timestamp - a.lastMessage.timestamp;
    });

    return filtered;
  }


  async getChannelRoomsForSubscribe(
    user: User,
  ): Promise<BaseResponseDto<number[]>> {
    const channelRooms = await this.channelRoomRepository.findAll({
      ...(user.roleId !== roleIdAdministrador
        ? { where: { userId: user.id } }
        : {}),
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          ...(user.roleId !== roleIdAdministrador
            ? user.roleId !== roleIdSupervisor
              ? { where: { officeId: user.officeId } }
              : {}
            : {}),
        },
      ],
    });
    let channelRoomsId = channelRooms.map((x) => x.dataValues.id);
    return {
      message: 'Channel Rooms para subscripciones',
      success: true,
      data: channelRoomsId,
    };
  }

  async getChatDetail(
    channelroomId: number,
    assistanceId: number,
    options?: {
      limit?: string;
      before?: string;
    },
  ): Promise<ChannelChatDetail> {
    let beforeFormat: Date | null = null;
    if (options?.before) {
      beforeFormat = new Date(options.before);
    }

    let formattedOptions = {
      limit: 30,
      before: beforeFormat,
    };
    const { limit = 50, before = beforeFormat } = formattedOptions || {};

    const room = await this.channelRoomRepository.findById(channelroomId, {
      include: [
        {
          model: ChannelCitizen,
          required: true,
          attributes: ['id', 'name', 'avatarUrl', 'fullName', 'phoneNumber'],
        },
        {
          model: ChannelAttention,
          where: { id: assistanceId },
          required: true,
          include: [
            {
              model: ChannelMessage,
              required: false,
              separate: true,
              order: [['timestamp', 'DESC']],
              where: before ? { timestamp: { [Op.lt]: before } } : {},
              include: [
                { model: User, as: 'user', required: true },
                { model: ChannelMessageAttachment, required: false },
              ],
              limit,
            },
          ],
        },
        {
          model: User,
          as: 'user',
          required: true,
        },
        {
          model: Inbox,
          required: true,
          include: [
            {
              model: InboxCredential,
              required: true,
              where: { expiresAt: null },
              attributes: ['phoneNumber'],
            },
            {
              model: Channel,
              required: true,
              attributes: ['name', 'logo'],
            },
          ],
        },
      ],
    });

    const chatroom = room.toJSON();
    const inbox = room?.get('inbox') as Inbox;
    const advisor = room?.get('user').toJSON() as User;

    const channel = inbox?.get('channel').toJSON() as Channel;
    const credentials = inbox?.get('credentials').toJSON() as InboxCredential;
    const citizen = room.get('citizen')?.toJSON() as ChannelCitizen;
    const assistance = room?.get('assistances')[0] as ChannelAttention;
    const messages = assistance?.get('messages') as ChannelMessage[];

    // Parse mensajes
    const messagesParsed: ChannelRoomMessage[] = messages
      .map((message) => {
        let messageParsed = message.toJSON();
        const messageAdvisor = message?.get('user').toJSON() as User;
        const messageAttachments = message?.get(
          'attachments',
        ) as ChannelMessageAttachment[];
        const attachments: Attachment[] = messageAttachments.map((x) => ({
          type: x.dataValues.type,
          size: x.dataValues.size,
          name: x.dataValues.name,
          content: x.dataValues.content,
          extension: x.dataValues.extension,
        }));

        let isAgent = ['agent', 'bot'].includes(messageParsed.senderType);
        return {
          id: messageParsed.id,
          content: messageParsed.content,
          attachments: attachments,
          sender: {
            id: isAgent ? messageAdvisor.id : citizen.id,
            alias: isAgent ? messageAdvisor.name : citizen.name,
            avatar: isAgent ? messageAdvisor.avatarUrl : citizen.avatarUrl,
            fromCitizen: messageParsed.senderType == 'citizen',
            fullName: isAgent ? messageAdvisor.displayName : citizen.fullName,
            isAgent: messageParsed.senderType == 'agent',
          },
          status: messageParsed.status,
          timestamp: new Date(messageParsed.timestamp),
          time: new Date(messageParsed.timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        } as ChannelRoomMessage;
      })
      .reverse();

    // Verificamos si hay más mensajes antiguos
    const hasMore = messages.length === limit;

    return {
      assistanceId: assistance.id,
      channelRoomId: room.id,
      externalRoomId: chatroom.externalChannelRoomId,
      citizen: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        fullName: citizen.fullName,
        avatar: citizen.avatarUrl,
        isActive: false,
        lastSeen: '',
        phone: citizen.phoneNumber,
        alias: citizen.phoneNumber,
      },
      channel: channel?.name as Channels,
      botStatus: chatroom.botReplies ? 'active' : 'paused',
      agentAssigned: {
        id: advisor.id,
        name: advisor.name,
        avatarUrl: advisor.avatarUrl,
        alias: advisor.displayName,
        email: advisor.email,
        phoneNumber: credentials.phoneNumber,
      },
      messages: messagesParsed,
      status: chatroom.status,
      hasMore, // 👈 agregado para scroll infinito
    } as ChannelChatDetail;
  }

  async sendMessage(message: CreateChannelAgentMessageDto, user: User) {
    try {
      let inboxCredentials: MessagingCredentials | null = null;
      const assistance = await this.assistanceRepository.findOne({
        where: {
          id: message.assistanceId,
        },
        include: [
          {
            model: ChannelRoom,
            required: true,
            include: [
              {
                model: ChannelCitizen,
                required: true,
              },
              {
                model: User,
                as: 'user',
                required: true,
              },
              {
                model: Inbox,
                required: true,
                include: [
                  {
                    model: InboxCredential,
                    required: true,
                    where: { expiresAt: null },
                    attributes: ['accessToken', 'phoneNumberId'],
                  },
                ],
              },
            ],
          },
        ],
      });
      if (!assistance) {
        throw new NotFoundException('No se encontraron datos del chat');
      }
      const channelRoom = assistance.get('channelRoom') as ChannelRoom;
      const inbox = channelRoom.get('inbox') as Inbox;
      const citizen = channelRoom.get('citizen').toJSON() as ChannelCitizen;
      const channelUser = channelRoom.get('user').toJSON() as User;
      const credentials = inbox?.get('credentials').toJSON() as InboxCredential;
      if (!credentials) {
        throw new UnauthorizedException('No se hallaron las credenciales');
      }
      inboxCredentials = {
        accessToken: credentials.accessToken as string,
        phoneNumberId: credentials.phoneNumberId as string,
      };

      const messageCreated =
        await this.multiChannelService.createChannelMessage({
          assistanceId: message.assistanceId,
          channelRoomId: message.channelRoomId,
          content: message.message,
          userId: user.id,
          senderType: 'agent',
          status: 'unread',
          timestamp: new Date(),
        });
      let attachments: MessageAttachment[] = [];

      if (message.attachments) {
        for (const element of message.attachments) {
          const size = this.base64FileSize(element.content ?? '');
          const newAttachment =
            await this.channelMessageAttachmentRepository.create({
              type: element.type,
              content: element.content ?? '',
              name: element.name,
              channelMessageId: messageCreated.dataValues.id,
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

      let messageToSend: OutgoingPayload = {
        chat_id: message.externalChannelRoomId,
        channel: message.channel,
        citizenId: channelRoom.dataValues.channelCitizenId as number,
        userId: channelRoom.dataValues.userId as number,
        assistanceId: message.assistanceId,
        channelRoomId: message.channelRoomId,
        message: message.message ?? '',
        attachments: attachments,
        botReply: false,
        credentials: inboxCredentials,
        timestamp: new Date(),
        phoneNumber: message.phoneNumber,
        to: message.phoneNumberReceiver,
      };
      if (message.channel === ChannelType.WHATSAPP) {
        messageToSend.options = {
          type: 'text',
          text: message.message,
        };
      }
      const response =
        await this.multiChannelService.sendMessageToExternal(messageToSend);

      let countUnreadMessages =
        await this.channelMessageRepository.findAndCountAll({
          where: {
            channelRoomId: channelRoom.dataValues.id,
            status: 'unread',
            senderType: 'citizen',
          },
        });

      let newMessage: ChannelRoomNewMessageDto = {
        channelRoomId: channelRoom.dataValues.id,
        botStatus: 'paused',
        assistanceId: assistance.dataValues.id,
        advisor: {
          id: channelUser.id,
          name: channelUser.name,
        },
        externalRoomId: message.externalChannelRoomId,
        channel: message.channel,
        status: channelRoom.dataValues.status,
        unreadCount: countUnreadMessages.total,
        message: {
          sender: {
            id: citizen.id,
            externalUserId: citizen.externalUserId || '',
            fullName: citizen.fullName || '',
            phone: citizen.phoneNumber,
            avatar: citizen.avatarUrl || '',
            alias: citizen.name,
            fromCitizen: false,
            isAgent: true,
          },
          attachments: attachments,
          externalMessageId: messageCreated.dataValues.externalMessageId,
          id: messageCreated.dataValues.id,
          message: messageCreated.dataValues.content,
          status: messageCreated.dataValues.status,
          time: new Date(
            messageCreated.dataValues.timestamp,
          ).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          fromMe: true,
        },
      };
      this.multiChannelChatGateway.handleNewMessage(newMessage);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'No se pudo enviar el mensaje',
      );
    }
  }

  async toggleBotService(payload: ToogleBotServicesDto) {
    const room = await this.channelRoomRepository.findById(
      payload.channelroomId,
      {
        include: [
          {
            model: ChannelCitizen,
            required: true,
            attributes: ['phoneNumber'],
          },
        ],
      },
    );
    const citizen: ChannelCitizen = room.get('citizen').toJSON();
    if (!citizen) {
      throw new Error('No se ha encontrado al ciudadano');
    }
    this.multiChannelChatGateway.notifyBotStatusChanged({
      channelRoomId: payload.channelroomId,
      botReplies: payload.active,
    });
    return this.channelRoomRepository.update(payload.channelroomId, {
      botReplies: payload.active,
    });
  }

  async handleChatViewed(channelroomId: number, currentUser: User) {
    const channelRoom = await this.channelRoomRepository.findById(
      channelroomId,
      {
        include: [
          {
            model: ChannelMessage,
            required: false,
            separate: true,
            where: { status: 'unread' },
            order: [['timestamp', 'ASC']],
          },
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: Channel,
                required: true,
                attributes: ['name', 'logo'],
              },
            ],
          },
        ],
      },
    );
    if (!channelRoom) return;

    const messages = channelRoom.messages as ChannelMessage[];

    await Promise.all(
      messages.map((message) => {
        if (message.status !== 'read') {
          return this.channelMessageRepository.update(message.id, {
            status: 'read',
          });
        }
      }),
    ).then((x) => {
      const inbox = channelRoom?.get('inbox') as Inbox;
      const channel = inbox?.get('channel').toJSON() as Channel;

      let viewedStatusReply: ChannelRoomViewStatusDto = {
        channel: channel.name as Channels,
        channelRoomId: channelRoom.id,
        readCount: messages.length,
      };
      this.multiChannelChatGateway.notifyChatViewedStatus(viewedStatusReply);
    });
  }

  async changeChannelRoomStatus(
    payload: changeChannelRoomStatusDto,
  ): Promise<BaseResponseDto> {
    try {
      const channelRoom = this.channelRoomRepository.findOne({
        where: { id: payload.channelRoomId },
        throwIfNotFound: false,
      });

      if (!channelRoom) {
        throw new NotFoundException('No se encontró la conversación.');
      }

      const response: BaseResponseDto = {
        message: 'El estado fue actualizado correctamente.',
        success: true,
      };
      if (payload.status == 'completado') {
        if (!payload.channelRoomId || !payload.assistanceId) {
          throw new BadRequestException(
            'Debe proporcionar el ID de room y el ID de asistencia.',
          );
        }
        const payloadToCloseService: CloseChannelAttentionDto = {
          assistanceId: payload.assistanceId,
          channelRoomId: payload.channelRoomId,
        };
        this.assistanceService.closeChannelAttention(payloadToCloseService);
        return response;
      } else {
        await this.channelRoomRepository.update(payload.channelRoomId, {
          status: payload.status,
        });
        this.multiChannelChatGateway.notifyChannelRoomStatusChanged(payload);
      }
      return response;
    } catch (error) {
      this.logger.error(error.toString());
      return {
        message: 'No se pudo hacer el camibo de estado',
        success: false,
        error: error.toString(),
      };
    }
  }

  async updateBasicInfoFromCitizen(
    payload: UpdateCitizenBasicInformationDto,
  ): Promise<UpdateCitizenBasicInformationDto> {
    try {
      const room = await this.channelRoomRepository.findOne({
        include: [
          {
            model: ChannelCitizen,
            required: true,
            where: { phoneNumber: payload.phoneNumber },
          },
        ],
        throwIfNotFound: false,
      });
      if (!room) throw new NotFoundException('No se encontró al ciudadano.');
      const citizen = await this.citizenRepository.update(
        room.dataValues.channelCitizenId!,
        {
          fullName: payload.fullName,
          documentType: payload.documentType as CitizenDocType,
          documentNumber: payload.documentNumber,
        },
      );
      return {
        phoneNumber: payload.phoneNumber,
        fullName: citizen[1][0].dataValues.fullName as string,
        documentType: citizen[1][0].dataValues.documentType as string,
        documentNumber: citizen[1][0].dataValues.documentNumber as string,
      };
    } catch (error) {
      throw error;
    }
  }

  async getBasicInfoFromCitizen(phoneNumber: string) {
    try {
      const room = await this.channelRoomRepository.findOne({
        include: [
          {
            model: ChannelCitizen,
            required: true,
            where: { phoneNumber },
          },
        ],
      });
      const citizen = room?.get('citizen').toJSON() as ChannelCitizen;
      if (!citizen)
        throw new NotFoundException(
          'El ciudadano no esta asociado a ningun chat.',
        );

      let model: UpdateCitizenBasicInformationDto = {
        phoneNumber: citizen.phoneNumber ?? '',
        fullName: citizen.fullName ?? '',
        documentType: citizen.documentType ?? '',
        documentNumber: citizen.documentNumber ?? '',
      };
      return model;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableAdvisors(
    channelroomId: number,
    currentUser: User,
  ): Promise<AdvisorsResponseDto[]> {
    const room = await this.channelRoomRepository.findById(channelroomId, {
      include: [
        {
          model: Inbox,
          required: true,
          include: [
            {
              model: User,
              as: 'users',
              required: true,
            },
          ],
        },
      ],
    });
    const inbox = room?.get('inbox') as Inbox;
    const users = inbox?.get('users') as User[];
    let response: AdvisorsResponseDto[] = users
      .filter((user: User) => user.id !== currentUser.id)
      .map((user: User) => {
        const userParsed: User = user.toJSON();

        return {
          id: userParsed.id as number,
          displayName: userParsed.displayName ?? userParsed.name,
          avatarUrl: userParsed.avatarUrl ?? '',
          email: userParsed.email,
          name: userParsed.name,
        };
      });

    return response;
  }

  async transferToAdvisor(
    channelroomId: number,
    advisorId: number,
    res: Response,
  ) {
    try {
      const room = await this.channelRoomRepository.findById(channelroomId, {
        include: [
          {
            model: User,
            as: 'user',
            required: true,
          },
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: User,
                as: 'users',
                required: true,
                where: { id: advisorId },
                order: [['createdAt', 'DESC']],
              },
            ],
          },
        ],
      });
      const advisor = room?.get('user').toJSON() as User;
      const inbox = room?.get('inbox') as Inbox;
      const newAdvisor = inbox.get('users') as User[];
      if (!newAdvisor || newAdvisor.length === 0 || !advisor) {
        throw new NotFoundException(
          'No se encontró al asesor. Asegúrese de que el asesor esté asociado al canal.',
        );
      }
      const newAdvisorParsed = newAdvisor[0].toJSON() as User;
      this.channelRoomRepository.update(channelroomId, {
        userId: newAdvisorParsed.id,
      });
      this.multiChannelChatGateway.notifyAdvisorChanged({
        channelRoomId: channelroomId,
        id: newAdvisorParsed.id,
        displayName: newAdvisorParsed.displayName ?? 'Unknown',
        name: newAdvisorParsed.name,
      });
      return res.status(200).json({
        message: `Se ha asignado la conversación al asesor ${newAdvisorParsed.name} correctamente`,
      });
    } catch (error) {
      throw new NotFoundException(
        'No se encontró al asesor. Asegúrese de que el asesor esté asociado al canal.',
      );
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

  onModuleDestroy() {
    // throw new Error("Method not implemented.");
  }
  onModuleInit() {
    // throw new Error("Method not implemented.");
  }
}
