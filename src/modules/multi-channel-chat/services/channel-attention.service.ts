import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChannelCitizen } from '../entities/channel-citizen.entity';
import {
  ChannelAttention,
  ChannelAttentionStatus,
} from '../entities/channel-attention.entity';
import { ChannelRoomRepository } from '../repositories/channel-room.repository';
import { Op } from 'sequelize';
import { ChannelAttentionRepository } from '../repositories/channel-attention.repository';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { CloseChannelAttentionDto } from '../dto/channel-attentions/close-assistance.dto';
import { MultiChannelChatGateway } from '../multi-channel-chat.gateway';
import { changeChannelRoomStatusDto } from '../dto/channel-room/change-channel-room-status.dto';
import { MessageBufferService } from './message-buffer.service';
import { BasicInfoService } from './basic-info.service';
import Redis from 'ioredis';
import {
  IChannelChatInformation,
  MultiChannelChatService,
} from '../multi-channel-chat.service';
import { EmailFeaturesService } from '@modules/email/services/email-features.service';
import { GenericEmail } from '@modules/email/dto/center-email.dto';
import { ChatEmailGenerator } from '../utils/chat-email-generator';
import { ChannelRoom } from '../entities/channel-room.entity';
import { ChannelMessageAttachment } from '../entities/channel-message-attachments.entity';
import { User } from '@modules/user/entities/user.entity';
import { ChannelMessage } from '../entities/channel-message.entity';
import { ChannelRoomMessage } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { MessageAttachment } from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { Attachment } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import {
  ChannelAttentionDto,
  MessagesResponseDto,
} from '../dto/channel-attentions/get-assistance.dto';
import * as dayjs from 'dayjs';
import { Channel } from '@modules/channel/entities/channel.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { AssignAttentionDetailDto } from '../dto/channel-attentions/assign-attention-detail.dto';

@Injectable()
export class ChannelAttentionService {
  private subscriber: Redis;
  private readonly logger = new Logger(ChannelAttentionService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly channelRoomRepository: ChannelRoomRepository,
    private readonly mailFeaturesService: EmailFeaturesService,
    private readonly assistanceRepository: ChannelAttentionRepository,
    @Inject(forwardRef(() => MessageBufferService))
    private readonly messageBufferService: MessageBufferService,
    @Inject(forwardRef(() => BasicInfoService))
    private readonly basicInfoService: BasicInfoService,
    @Inject(forwardRef(() => MultiChannelChatService))
    private readonly multiChannelChatService: MultiChannelChatService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private readonly multiChannelChatGateway: MultiChannelChatGateway,
  ) {
    this.subscriber = new Redis();
  }

  async assignAttentionDetail(payload: AssignAttentionDetailDto): Promise<BaseResponseDto>
  {
    let response :BaseResponseDto ={
      success: false,
      message: ""
    }
    try {
      if(payload.attentionId)
      {
        const attentionUpdated = await this.assistanceRepository.update(payload.attentionId, {
          attentionDetail: payload.attentionDetail,
          consultTypeId: payload.consultTypeId
        });

        this.multiChannelChatGateway.notifyAttentionDetailChanged({
          assistanceId: payload.attentionId
        })

        response.message = "Se ha creado el detalle de atención correctamente";
        response.success = true;
      }
      return response
    } catch (error) {
      response.error = error.toString();
      return response;
      this.logger.error(error.toString())      
    }
  }

  async closeChannelAttention(
    payload: CloseChannelAttentionDto,
  ): Promise<BaseResponseDto> {
    try {
      let channelRoomIdToClose: number | null | undefined =
        payload?.channelRoomId;
      let assistanceIdToClose: number | null | undefined = payload?.assistanceId;
      let userIdClosing: number | null | undefined = null;
      let citizenIdToClose: number | null | undefined = null;
      let phoneNumberToCleanup: string | null = null;

      if (
        !payload?.channelRoomId &&
        !payload?.assistanceId &&
        payload?.phoneNumber
      ) {
        let channelRoom = await this.channelRoomRepository.findOne({
          include: [
            {
              model: ChannelCitizen,
              required: true,
              where: {
                phoneNumber: payload.phoneNumber,
              },
            },
            {
              model: ChannelAttention,
              required: true,
              where: {
                endDate: { [Op.is]: null },
                status: { [Op.not]: ChannelAttentionStatus.CLOSED },
              },
            },
          ],
          throwIfNotFound: false,
        });
        channelRoomIdToClose = channelRoom?.dataValues.id;
        citizenIdToClose = channelRoom?.dataValues?.channelCitizenId;
        const assistanceParsed = channelRoom?.get('assistances')[0].toJSON() as ChannelAttention;
        assistanceIdToClose = assistanceParsed?.id;

        phoneNumberToCleanup = payload.phoneNumber;
        userIdClosing = channelRoom?.dataValues?.userId;
      } else if (payload.channelRoomId) {
        const channelRoom = await this.channelRoomRepository.findOne({
          where: { id: payload.channelRoomId },
          include: [
            {
              model: ChannelCitizen,
              required: true,
            },
          ],
          throwIfNotFound: false,
        });
        phoneNumberToCleanup = channelRoom?.citizen?.phoneNumber ?? '';
      }

      if (!channelRoomIdToClose || !assistanceIdToClose) {
        throw new NotFoundException('No se ha encontrado el ticket a cerrar.');
      }

      this.channelRoomRepository.update(channelRoomIdToClose, {
        status: 'completado',
        botReplies: true,
      });

      this.assistanceRepository.update(assistanceIdToClose, {
        status: ChannelAttentionStatus.CLOSED,
        endDate: new Date(),
      });

      if (phoneNumberToCleanup) {
        await this.redis.del(`message_buffer_timeout:${phoneNumberToCleanup}`);
        await this.redis.del(`basic_info_timeout:${phoneNumberToCleanup}`);
        await this.messageBufferService.clearUserTimeout(phoneNumberToCleanup);
        await this.basicInfoService.cleanupBasicInfoProcess(
          phoneNumberToCleanup,
        );
      }

      const payloadToEmit: changeChannelRoomStatusDto = {
        assistanceId: assistanceIdToClose,
        channelRoomId: channelRoomIdToClose,
        status: 'completado',
      };
      const channelChatInformationPayload: IChannelChatInformation = {
        channelRoomId: channelRoomIdToClose,
        assistanceId: assistanceIdToClose,
        channelCitizenId: citizenIdToClose,
        userId: userIdClosing,
      };

      this.multiChannelChatGateway.notifyChannelRoomStatusChanged(
        payloadToEmit,
      );
      this.multiChannelChatService.handleChatCompletedEvent(
        channelChatInformationPayload,
      );
      return {
        message: 'La asistencia fue cerrada correctamente.',
        success: true,
      };
    } catch (error) {
      this.logger.error(error.toString());
      return {
        message: 'La asistencia no fue cerrada, debido a un problema.',
        error: error.toString(),
        success: false,
      };
    }
  }

  async getChannelAttentions(
    channelRoomId: number,
  ): Promise<BaseResponseDto<ChannelAttentionDto[]>> {
    let response: BaseResponseDto<ChannelAttentionDto[]> = {
      success: false,
      data: [],
      message: '',
    };
    try {
      if (isNaN(channelRoomId)) {
        throw new BadRequestException('channelRoomId debe ser numérico');
      }
      const channelRoom: ChannelRoom | null =
        await this.channelRoomRepository.findOne({
          where: { id: channelRoomId },
          include: [
            {
              model: ChannelAttention,
              required: true,
              include: [
                {
                  model: ChannelMessage,
                  required: false,
                  separate: true,
                  order: [['timestamp', 'DESC']],
                  limit: 1,
                  include: [
                    { model: User, as: 'user', required: false },
                    { model: ChannelMessageAttachment, required: false },
                  ],
                },
              ],
            },
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
                  model: Channel,
                  required: true,
                },
              ],
            },
          ],
        });

      if (!channelRoom) {
        throw new NotFoundException('No se ha encontrado el channel Room');
      }
      const assistances = channelRoom.get('assistances') as ChannelAttention[];
      const inbox = channelRoom.get('inbox') as Inbox;
      const channel = inbox.get('channel').toJSON() as Channel;
      const citizen = channelRoom.get('citizen').toJSON() as ChannelCitizen;
      const user = channelRoom.get('user')?.toJSON() as User | null;

      response.data = assistances.map((assistance) => {
        const assistanceParsed = assistance.toJSON() as ChannelAttention;
        this.logger.debug(assistanceParsed);
        const channelMessages = assistance?.get('messages') as ChannelMessage[];
        const lastMessage = channelMessages[0];
        const lastMessageParsed = channelMessages[0].toJSON();

        const formatDate = (date: Date) =>
          dayjs(date).format('DD/MM/YYYY HH:mm');
        const messageAdvisor = lastMessage?.get('user')?.toJSON() as User | null;
        const messageAttachments = lastMessage?.get(
          'attachments',
        ) as ChannelMessageAttachment[];
        const attachments: Attachment[] = messageAttachments.map((x) => ({
          type: x.dataValues.type,
          size: x.dataValues.size,
          name: x.dataValues.name,
          content: x.dataValues.content,
          extension: x.dataValues.extension,
        }));

        let isAgent = ['agent', 'bot'].includes(lastMessageParsed.senderType);

        let model: ChannelAttentionDto = {
          assistanceId: assistanceParsed.id,
          channelRoomId: channelRoom.dataValues.id,
          lastMessage: {
            id: lastMessageParsed.id,
            content: lastMessageParsed.content,
            attachments: attachments,
            sender: {
              id: isAgent ? messageAdvisor?.id : citizen.id,
              alias: isAgent ? messageAdvisor?.name : citizen.name,
              avatar: isAgent ? messageAdvisor?.avatarUrl : citizen.avatarUrl,
              fromCitizen: lastMessageParsed.senderType == 'citizen',
              fullName: isAgent ? messageAdvisor?.displayName : citizen.fullName,
              isAgent: lastMessageParsed.senderType == 'agent',
            },
            status: lastMessageParsed.status,
            timestamp: new Date(lastMessageParsed.timestamp),
            time: new Date(lastMessageParsed.timestamp).toLocaleTimeString(
              'es-PE',
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            ),
          },
          channel: channel?.name,
          startDate: formatDate(assistanceParsed.startDate),
          endDate: assistanceParsed?.endDate
            ? formatDate(assistanceParsed.endDate)
            : null,
          status: assistanceParsed.status,
          user: user?.name,
          citizen: citizen.name,
        };
        return model;
      });

      response.message = 'Listado de asistencias';
      response.success = true;
      return response;
    } catch (error) {
      this.logger.error(error.toString());
      response.error = error.toString();
      response.success = false;
      return response;
    }
  }

  async getMessagesFromChannelAttention(
    assistanceId: number,
  ): Promise<BaseResponseDto<MessagesResponseDto>> {
    let response: BaseResponseDto<MessagesResponseDto> = {
      message: '',
      success: false,
    };
    try {
      const assistanceSearch: ChannelAttention | null =
        await this.assistanceRepository.findOne({
          include: [
            {
              model: ChannelRoom,
              required: true,
              include: [
                {
                  model: ChannelCitizen,
                  required: true,
                },
              ],
            },
            {
              model: ChannelMessage,
              required: false,
              separate: true,
              order: [['timestamp', 'DESC']],
              include: [
                { model: User, as: 'user', required: false },
                { model: ChannelMessageAttachment, required: false },
              ],
            },
          ],
          where: { id: assistanceId },
        });

      if (!assistanceSearch) {
        throw new NotFoundException('No se ha encontrado dicha asistencia');
      }

      const channelRoom = assistanceSearch?.get('channelRoom') as ChannelRoom;
      const channelMessages = assistanceSearch?.get(
        'messages',
      ) as ChannelMessage[];
      const citizen = channelRoom?.get('citizen') as ChannelCitizen;

      const messagesParsed: ChannelRoomMessage[] = channelMessages
        .map((message) => {
          let messageParsed = message.toJSON();
          const messageAdvisor = message?.get('user')?.toJSON() as User | null;
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
              id: isAgent ? messageAdvisor?.id : citizen.id,
              alias: isAgent ? messageAdvisor?.name : citizen.name,
              avatar: isAgent ? messageAdvisor?.avatarUrl : citizen.avatarUrl,
              fromCitizen: messageParsed.senderType == 'citizen',
              fullName: isAgent ? messageAdvisor?.displayName : citizen.fullName,
              isAgent: messageParsed.senderType == 'agent',
            },
            status: messageParsed.status,
            timestamp: new Date(messageParsed.timestamp),
            time: new Date(messageParsed.timestamp).toLocaleTimeString(
              'es-PE',
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            ),
          } as ChannelRoomMessage;
        })
        .reverse();

      response.success = true;
      response.message = 'Lista de mensajes de este ticket';
      response.data = {
        assistanceId: assistanceSearch?.dataValues.id as number,
        channelRoomId: channelRoom.dataValues.id,
        messages: messagesParsed,
      };
      return response;
    } catch (error) {
      this.logger.error(error);
      response.error = error.toString();
      return response;
    }
  }

  async sendMessagesHtmlFromChannelAttention(
    assistanceId: number,
  ): Promise<BaseResponseDto> {
    let response: BaseResponseDto = {
      message: '',
      success: false,
    };
    try {
      const assistanceSearch: ChannelAttention | null =
        await this.assistanceRepository.findOne({
          include: [
            {
              model: ChannelRoom,
              required: true,
              include: [{ model: ChannelCitizen, required: true }],
            },
            {
              model: ChannelMessage,
              required: false,
              separate: true,
              order: [['timestamp', 'ASC']],
              include: [
                { model: User, as: 'user', required: false },
                { model: ChannelMessageAttachment, required: false },
              ],
            },
          ],
          where: { id: assistanceId },
        });

      if (!assistanceSearch) {
        throw new NotFoundException('No se ha encontrado dicha asistencia');
      }

      const channelRoom = assistanceSearch.get('channelRoom') as ChannelRoom;
      const citizen = channelRoom.get('citizen').toJSON() as ChannelCitizen;

      // 2. Generar el HTML con tu generador
      const html = await ChatEmailGenerator.generateEmailHtml(assistanceSearch);

      // 3. Construir el payload
      /**
       * TODO: REMPLAZAR CORREO DE PRUEBA POR:
       *
       */
      const payload: GenericEmail = {
        subject: 'consulta',
        content: 'contenido',
        to: citizen?.email ?? 'Edward_Developer@outlook.com',
        html: JSON.stringify(html),
      };

      // 4. Enviar petición POST
      await this.mailFeaturesService.buildGenericEmail(payload);

      this.logger.log(
        `Correo generado y enviado correctamente para asistencia ${assistanceId}`,
      );

      response.message = 'Correo generado y enviado correctamente.';
      response.success = true;
      return response;
    } catch (error) {
      this.logger.error(
        `Error enviando correo para asistencia ${assistanceId}:`,
        error,
      );
      response.error = error.toString();
      response.success = false;
      return response;
    }
  }
}
