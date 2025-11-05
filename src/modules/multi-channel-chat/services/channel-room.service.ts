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
  QueryType,
  QueryTypeToConsultType,
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
import { UserRole } from '@common/constants/role.constant';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { CreateChannelQueryHistoryDto } from '../dto/channel-query-history/create-channel-query-history.dto';
import { ChannelQueryHistoryRepository } from '../repositories/channel-room.repository copy';
import { ConsultTypeRepository } from '@modules/consult-type/repositories/consult-type.repository';
import { UserRepository } from '@modules/user/repositories/user.repository';

@Injectable()
export class ChannelRoomService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChannelRoomService.name);

  constructor(
    @Inject(forwardRef(() => MultiChannelChatService))
    private multiChannelService: MultiChannelChatService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private multiChannelChatGateway: MultiChannelChatGateway,
    private channelRoomRepository: ChannelRoomRepository,
    private channelAttentionRepository: ChannelAttentionRepository,
    private userRepository: UserRepository,
    private citizenRepository: ChannelCitizenRepository,
    private assistanceService: ChannelAttentionService,
    private consultTypeRepository: ConsultTypeRepository,
    private channelQueryHistory: ChannelQueryHistoryRepository,
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
    const isAdminOrSupervisor = ['administrador', 'supervisor'].includes(
      currentUserRole.name,
    );

    const inboxes = currentUserInboxes.map((x) => x.dataValues.inboxId);

    const attentions = await this.channelAttentionRepository.findAll({
      subQuery: false,
      where:
        query?.messageStatus !== null && query?.messageStatus !== undefined
          ? {
              status: {
                [Op.in]: [
                  ChannelAttentionStatus.IDENTITY_VERIFICATION,
                  ChannelAttentionStatus.IN_PROGRESS,
                  ChannelAttentionStatus.PRIORITY,
                ],
              },
              endDate: { [Op.is]: null },
              userId: { [Op.not]: null },
              ...(isAdminOrSupervisor ? {} : { userId: user.id }),
            }
          : query?.allChats
            ? {
                status: {
                  [Op.in]: [
                    ChannelAttentionStatus.IDENTITY_VERIFICATION,
                    ChannelAttentionStatus.IN_PROGRESS,
                  ],
                },
                endDate: { [Op.is]: null },
                userId: { [Op.is]: null },
              }
            : isAdminOrSupervisor
              ? {
                  ...(query?.chatStatus === 'completado'
                    ? {
                        status: ChannelAttentionStatus.CLOSED,
                        endDate: { [Op.not]: null },
                      }
                    : query?.chatStatus === 'prioridad'
                      ? {
                          status: ChannelAttentionStatus.PRIORITY,
                          endDate: { [Op.is]: null },
                          userId: { [Op.not]: null },
                        }
                      : query?.chatStatus === 'pendiente'
                        ? {
                            status: {
                              [Op.in]: [
                                ChannelAttentionStatus.IDENTITY_VERIFICATION,
                                ChannelAttentionStatus.IN_PROGRESS,
                              ],
                            },
                            endDate: { [Op.is]: null },
                            userId: { [Op.not]: null },
                          }
                        : {}),
                }
              : {
                  userId: user.id,
                  ...(query?.chatStatus === 'completado'
                    ? {
                        status: ChannelAttentionStatus.CLOSED,
                        endDate: { [Op.not]: null },
                      }
                    : query?.chatStatus === 'prioridad'
                      ? {
                          status: ChannelAttentionStatus.PRIORITY,
                          endDate: { [Op.is]: null },
                        }
                      : query?.chatStatus === 'pendiente'
                        ? {
                            status: {
                              [Op.in]: [
                                ChannelAttentionStatus.IDENTITY_VERIFICATION,
                                ChannelAttentionStatus.IN_PROGRESS,
                              ],
                            },
                            endDate: { [Op.is]: null },
                          }
                        : {}),
                },
      order: [['startDate', 'DESC']],
      limit: 9999,
      include: [
        {
          model: User,
          as: 'user',
          required: false,
          attributes: ['id', 'name', 'displayName', 'avatarUrl'],
        },
        {
          model: ChannelRoom,
          required: true,
          include: [
            {
              model: ChannelCitizen,
              required: true,
              ...(query?.search
                ? { where: { name: { [Op.like]: `%${query?.search}%` } } }
                : {}),
              attributes: [
                'id',
                'name',
                'fullName',
                'avatarUrl',
                'phoneNumber',
              ],
            },
            {
              model: User,
              as: 'user',
              required: false,
              attributes: ['id', 'name', 'displayName', 'avatarUrl'],
            },
            {
              model: Inbox,
              required: true,
              ...(!isAdminOrSupervisor ? { where: { id: inboxes } } : {}),
              include: [
                {
                  model: Channel,
                  required: true,
                  attributes: ['name', 'logo'],
                  ...(query?.channel !== 'all'
                    ? { where: { name: query?.channel } }
                    : {}),
                },
              ],
            },
          ],
        },
        {
          model: ChannelMessage,
          required: false,
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

    for (const attention of attentions) {
      const attentionParsed = attention.toJSON();
      const channelRoom = attention.get('channelRoom') as ChannelRoom;
      const chatroom = channelRoom?.toJSON();
      const inbox = channelRoom?.get('inbox') as Inbox;
      const channel = inbox?.get('channel')?.toJSON() as Channel;
      const messages = attention?.get('messages')[0] as ChannelMessage;
      const lastMessage = !messages ? null : messages.toJSON();
      const citizen = channelRoom?.get('citizen')?.toJSON() as ChannelCitizen;
      // const advisor = channelRoom?.get('user')?.toJSON() as User | null;

      if (!lastMessage) continue;

      const unreadCount = await this.channelMessageRepository.findAndCountAll({
        where: {
          assistanceId: attention.id,
          status: 'unread',
          senderType: 'citizen',
        },
      });

      result.push({
        channelRoomId: chatroom?.id,
        attention: {
          id: attentionParsed.id,
          status: attentionParsed.status,
          attentionDetail: attentionParsed?.attentionDetail,
          consultTypeId: attentionParsed?.consultTypeId,
          endDate: attentionParsed.endDate,
        },
        externalRoomId: chatroom?.externalChannelRoomId,
        channel: channel?.name,
        status: chatroom?.status,
        advisor: {
          id: attentionParsed?.user?.id,
          name:
            attentionParsed?.user?.displayName || attentionParsed?.user?.name,
        },
        lastMessage: {
          citizen: {
            id: citizen?.id,
            name: citizen?.name ?? '',
            fullName: citizen?.fullName ?? '',
            avatar: citizen?.avatarUrl || '',
            phone: citizen?.phoneNumber,
          },
          hasAttachment:
            lastMessage?.attachments && lastMessage?.attachments.length > 0,
          externalMessageId: lastMessage?.externalMessageId,
          id: lastMessage?.id,
          message: lastMessage?.content,
          status: lastMessage?.status,
          time: lastMessage?.timestamp,
          timestamp: new Date(lastMessage?.timestamp).getTime(),
          fromMe: lastMessage?.senderType !== 'citizen',
        },
        unreadCount: unreadCount.total as number,
        botStatus: chatroom?.botReplies ? 'active' : 'paused',
      });
    }

    if (result.length) {
      result.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    }

    // if (query?.chatStatus) {
    //   return result.filter((ch) => ch.status === query.chatStatus);
    // }

    if (query.messageStatus) {
      return result.filter(
        (ch) => ch.lastMessage.status === query.messageStatus,
      );
    }
    // const filtered = result.filter(
    //   (ch) => ch.lastMessage.status === 'unread' || ch.status === 'prioridad',
    // );

    result.sort((a, b) => {
      if (a.status === 'prioridad' && b.status !== 'prioridad') return -1;
      if (b.status === 'prioridad' && a.status !== 'prioridad') return 1;
      return b.lastMessage.timestamp - a.lastMessage.timestamp;
    });

    return result;
  }

  async getChannelRoomsForSubscribe(
    user: User,
  ): Promise<BaseResponseDto<number[]>> {
    const channelRooms = await this.channelRoomRepository.findAll({
      ...(user.roleId !== UserRole.Adm ? { where: { userId: user.id } } : {}),
      include: [
        {
          model: User,
          as: 'user',
          required: false,
          ...(user.roleId !== UserRole.Adm && user.roleId !== UserRole.Sup
            ? { where: { officeId: user.officeId } }
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
              model: User,
              as: 'user',
              required: false,
            },
            {
              model: ChannelMessage,
              required: false,
              separate: true,
              order: [['timestamp', 'DESC']],
              where: before ? { timestamp: { [Op.lt]: before } } : {},
              include: [
                { model: User, as: 'user', required: false },
                { model: ChannelMessageAttachment, required: false },
              ],
              limit,
            },
          ],
        },
        {
          model: User,
          as: 'user',
          required: false,
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
    const advisor = room?.get('user')?.toJSON() as User | null;

    const channel = inbox?.get('channel').toJSON() as Channel;
    const credentials = inbox?.get('credentials').toJSON() as InboxCredential;
    const citizen = room.get('citizen')?.toJSON() as ChannelCitizen;
    const assistance = room?.get('assistances')[0] as ChannelAttention;
    const attentionParsed = assistance.toJSON();
    const messages = assistance?.get('messages') as ChannelMessage[];

    // Parse mensajes
    const messagesParsed: ChannelRoomMessage[] = messages
      .map((message) => {
        let messageParsed = message.toJSON();
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
            id: isAgent ? attentionParsed?.user?.id : citizen.id,
            alias: isAgent ? attentionParsed?.user?.name : citizen.name,
            avatar: isAgent
              ? attentionParsed?.user?.avatarUrl
              : citizen.avatarUrl,
            fromCitizen: messageParsed.senderType == 'citizen',
            fullName: isAgent
              ? attentionParsed?.user?.displayName
              : citizen.fullName,
            isAgent: messageParsed.senderType == 'agent',
          },
          status: messageParsed.status,
          timestamp: messageParsed.timestamp
        } as ChannelRoomMessage;
      })
      .reverse();

    // Verificamos si hay más mensajes antiguos
    const hasMore = messages.length === limit;

    return {
      assistanceId: assistance.id,
      channelRoomId: room.id,
      attention: {
        id: attentionParsed.id,
        status: attentionParsed.status,
        attentionDetail: attentionParsed.attentionDetail,
        consultTypeId: attentionParsed.consultTypeId,
        endDate: attentionParsed.endDate,
      },
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
        id: advisor?.id,
        name: advisor?.name,
        avatarUrl: advisor?.avatarUrl,
        alias: advisor?.displayName,
        email: advisor?.email,
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
      const assistance = await this.channelAttentionRepository.findOne({
        where: {
          id: message.assistanceId,
        },
        include: [
          {
            model: User,
            as: 'user',
            required: false,
          },
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
                required: false,
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
      const attentionParsed = assistance.toJSON();
      const channelRoom = assistance.get('channelRoom') as ChannelRoom;
      const inbox = channelRoom.get('inbox') as Inbox;
      const citizen = channelRoom.get('citizen').toJSON() as ChannelCitizen;
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
        userId: channelRoom?.dataValues?.userId as number,
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
        attention: {
          id: attentionParsed.id,
          status: attentionParsed.status,
          attentionDetail: attentionParsed?.attentionDetail,
          consultTypeId: attentionParsed?.consultTypeId,
          endDate: attentionParsed?.endDate,
        },
        advisor: {
          id: user?.id,
          name: user?.name,
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
          time: messageCreated.dataValues.timestamp,
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
      await this.channelRoomRepository.update(payload.channelRoomId, {
        status: payload.status,
      });

      switch (payload.status) {
        case 'completado':
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
          break;
        case 'prioridad':
          await this.channelAttentionRepository.update(payload.assistanceId, {
            status: ChannelAttentionStatus.PRIORITY,
          });
          this.multiChannelChatGateway.notifyChannelRoomStatusChanged(payload);
          break;
        case 'pendiente':
          await this.channelAttentionRepository.update(payload.assistanceId, {
            status: ChannelAttentionStatus.IN_PROGRESS,
          });
          this.multiChannelChatGateway.notifyChannelRoomStatusChanged(payload);
          break;
        default:
          break;
      }
      return response;
    } catch (error) {
      this.logger.error(error.toString());
      return {
        message: 'No se pudo hacer el cambio de estado',
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
              required: false,
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
    priorityNotification: boolean = false,
  ): Promise<BaseResponseDto> {
    let response: BaseResponseDto = {
      success: false,
      message: '',
    };
    try {
      const room = await this.channelRoomRepository.findById(channelroomId, {
        include: [
          {
            model: ChannelAttention,
            required: false,
            where: {
              status: {
                [Op.not]: ChannelAttentionStatus.CLOSED,
              },
            },
            order: [['startDate', 'DESC']],
            limit: 1,
          },
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: User,
                as: 'users',
                required: false,
                where: { id: advisorId },
                order: [['createdAt', 'DESC']],
              },
            ],
          },
        ],
      });
      const attention = room.get('assistances')[0] as ChannelAttention;
      const attentionParsed = attention.toJSON() as ChannelAttention;
      const inbox = room?.get('inbox') as Inbox;
      const newAdvisor = await this.userRepository.findById(advisorId);
      if (!newAdvisor) {
        throw new NotFoundException(
          'No se encontró al asesor. Asegúrese de que el asesor esté asociado al canal.',
        );
      }
      const newAdvisorParsed = newAdvisor.toJSON() as User;
      attention.update({
        userId: newAdvisorParsed.id,
      });
      this.channelRoomRepository.update(channelroomId, {
        userId: newAdvisorParsed.id,
      });
      if (priorityNotification) {
        this.multiChannelChatGateway.notifyAdvisorRequest(
          channelroomId,
          attentionParsed.id,
          newAdvisorParsed.id,
        );
      } else {
        this.multiChannelChatGateway.notifyAdvisorChanged({
          channelRoomId: channelroomId,
          attentionId: attentionParsed.id,
          id: newAdvisorParsed.id,
          displayName: newAdvisorParsed.displayName ?? 'Unknown',
          name: newAdvisorParsed.name,
        });
      }
      response.message = `Se ha asignado la conversación al asesor ${newAdvisorParsed.name} correctamente`;
      response.success = true;
      return response;
    } catch (error) {
      this.logger.error(error.toString());
      response.error = error;
      response.message =
        'No se encontró al asesor. Asegúrese de que el asesor esté asociado al canal.';
      return response;
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

  async checkForAvailableAdvisors() {
    const inboxUsers = await this.inboxUserRepository.findAll({
      include: [
        {
          model: Inbox,
          required: true,
          include: [
            {
              model: Channel,
              required: true,
              where: {
                name: ChannelType.CHATSAT,
              },
            },
          ],
        },
        {
          model: ChannelState,
          required: true,
          where: {
            name: 'Disponible',
          },
        },
      ],
    });
    return {
      availableAdvisors: inboxUsers.length,
    };
  }

  async saveBotQuery(
    payload: CreateChannelQueryHistoryDto,
    phoneNumber: string,
  ) {
    const attentionResult = await this.channelAttentionRepository.findOne({
      where: { status: ChannelAttentionStatus.IN_PROGRESS },
      include: [
        {
          model: ChannelRoom,
          required: true,
          where: { status: 'pendiente', botReplies: true },
          include: [
            {
              model: ChannelCitizen,
              required: true,
              where: { phoneNumber: phoneNumber },
            },
          ],
        },
      ],
    });

    if (!attentionResult)
      throw new NotFoundException('No se encontró un chat con este número.');

    const attention = attentionResult.toJSON() as ChannelAttention;
    if (!attention.consultTypeId) {
      const consultType = (
        await this.consultTypeRepository.findOne({
          where: {
            name: this.getConsultTypeByQuery(payload.queryType),
          },
        })
      )?.toJSON();

      this.channelAttentionRepository.update(attention.id, {
        consultTypeId: consultType.id,
      });
    }

    this.channelQueryHistory.create({ ...payload, attentionId: attention.id });
  }

  getConsultTypeByQuery(query: QueryType): string {
    return QueryTypeToConsultType[query] ?? 'Desconocido';
  }
  onModuleDestroy() {
    // throw new Error("Method not implemented.");
  }
  onModuleInit() {
    // throw new Error("Method not implemented.");
  }
}
