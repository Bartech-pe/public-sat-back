import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChannelCitizenRepository } from '../repositories/channel-citizen.repository';
import { UpdateCitizenBasicInformationDto } from '../dto/channel-room/update-citizen-basic-info.dto';
import { ChannelRoomRepository } from '../repositories/channel-room.repository';
import { ChannelCitizen } from '../entities/channel-citizen.entity';
import { CitizenDocType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { MultiChannelChatGateway } from '../multi-channel-chat.gateway';
import { CreateChannelCitizenDto } from '../dto/channel-citizens/create-channel-citizen.dto';
import { IncomingMessage } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import { Op } from 'sequelize';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { ChannelAttentionRepository } from '../repositories/channel-attention.repository';
import {
  ChannelAttentionStatus,
  ChannelAttention,
} from '../entities/channel-attention.entity';
import { ChannelRoom } from '../entities/channel-room.entity';
import { ChannelMessage } from '../entities/channel-message.entity';
import { GetAttentionsOfCitizenDto } from '../dto/channel-citizens/attentions/get-attentions-of-citizen.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { User } from '@modules/user/entities/user.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { MultiChannelChatService } from '../multi-channel-chat.service';
import { ChannelRoomService } from './channel-room.service';
import { ChannelQueryHistory } from '../entities/channel-query-history.entity';

@Injectable()
export class ChannelCitizenService {
  private readonly logger = new Logger(ChannelCitizenService.name);

  constructor(
    private citizenRepository: ChannelCitizenRepository,
    private channelAttentionRepository: ChannelAttentionRepository,
    private channelRoomRepository: ChannelRoomRepository,
    private channelRoomService: ChannelRoomService,
    private inboxUserRepository : InboxUserRepository,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private multiChannelChatGateway: MultiChannelChatGateway,
    @Inject(forwardRef(() => MultiChannelChatService))
    private multiChannelChatService: MultiChannelChatService,
  ) {}

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

  async requestAdvisor(phoneNumber: string) {
    try {
      const assistanceResult = await this.channelAttentionRepository.findOne({
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

      if (!assistanceResult)
        throw new NotFoundException('No se encontró un chat con este número.');

      const assistance = assistanceResult.toJSON() as ChannelAttention;
      const channelRoom = assistanceResult
        .get('channelRoom')
        .toJSON() as ChannelRoom;

      channelRoom.update({
        status: 'prioridad' 
      })

      assistance.update({
        status: ChannelAttentionStatus.PRIORITY
      })

      let selectedUserId: number | undefined = await this.multiChannelChatService.searchAdvisorAvailable(
         channelRoom.inboxId
      );
      if(!selectedUserId){
        throw new NotFoundException("No se encontraron asesores disponibles para este canal")
      }
      this.channelRoomService.transferToAdvisor(channelRoom.id, selectedUserId, true)
      
    } catch (error) {
      throw error;
    }
  }


  public async createCitizenFromMessage(
    newMessage: IncomingMessage,
  ): Promise<ChannelCitizen> {
    const message = newMessage.payload;

    const possibleNamesDuplicated = [
      message?.sender?.full_name,
      message?.sender?.alias,
      message?.sender?.phone_number,
      'Unknown',
    ].filter((n): n is string => typeof n === 'string');

    const citizenExists = await this.citizenRepository.findOne({
      ...(newMessage.payload.channel === ChannelType.CHATSAT
        ? {
            where: {
              id: message?.sender.id,
            },
          }
        : {
            where: {
              phoneNumber: message?.sender?.phone_number,
              name: {
                [Op.in]: possibleNamesDuplicated,
              },
            },
          }),
    });

    if (citizenExists) {
      return citizenExists.toJSON();
    }

    const temporalDto: CreateChannelCitizenDto = {
      name:
        message?.sender?.full_name ||
        message?.sender?.alias ||
        message?.sender?.phone_number ||
        'Unknown',
      phoneNumber: message?.sender?.phone_number,
      externalUserId: message?.sender?.id?.toString(),
      isExternal: newMessage.payload.channel === ChannelType.CHATSAT,
      email: message?.sender?.email?.toString(),
      avatarUrl:
        message?.sender?.avatar ??
        'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    };

    return (await this.citizenRepository.create(temporalDto)).toJSON();
  }

  public async getCommunicationsHistoryFromCitizen(
    dni: string,
  ): Promise<BaseResponseDto<GetAttentionsOfCitizenDto[]>> {
    const response: BaseResponseDto<GetAttentionsOfCitizenDto[]> = {
      message: '',
      success: false,
      error: '',
    };
    try {
      const channelAttentions: ChannelAttention[] =
        await this.channelAttentionRepository.findAll({
          include: [
            {
              model: ChannelQueryHistory,
              required: false
            },
            {
              model: ChannelRoom,
              required: true,
              include: [
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
                {
                  model: ChannelCitizen,
                  required: true,
                  where: {
                    documentNumber: dni,
                  },
                },
                {
                  model: User,
                  as: 'user',
                  required: false,
                },
              ],
            },
            {
              model: ChannelMessage,
              required: true,
            },
            {
              model: ConsultType,
              required: false
            }
          ],
        });
      response.success = true;
      response.message = 'Listado de atenciones del ciudadano';
      response.data = channelAttentions.map((attention) => {
        const attentionParsed = attention.toJSON();
        const attentionMessages = attentionParsed.messages as ChannelMessage[];
        const queryHistory = attentionParsed.queryHistory as ChannelQueryHistory[];
        const attentionChannel = attentionParsed.channelRoom as ChannelRoom;
        const user = attentionChannel?.user as User | null;
        const citizen = attentionChannel.citizen;
        const channelInbox = attentionChannel.inbox as Inbox;
        const attentionConsultType = attentionParsed.consultType as ConsultType;
        const inboxChannel = channelInbox.channel as Channel;

        const advisorIntervention: boolean = attentionMessages.some(
          (message: ChannelMessage) => message.senderType == 'agent',
        );

        return {
          channel: inboxChannel.name,
          startDate: attentionParsed.startDate,
          endDate: attentionParsed.endDate,
          advisorIntervention: advisorIntervention,
          user: advisorIntervention ? user?.displayName : '',
          category: '',
          type: attentionConsultType?.name,
          email: citizen.email,
          queryHistory
        };
      });
      return response;
    } catch (error) {
      this.logger.error(error.toString());
      response.success = false;
      response.error = error.toString();
      return response;
    }
  }

  async getCitizenInformationByChannelRoomAssigned(channelRoomId: number): Promise<BaseResponseDto<ChannelCitizen>>
  {
    let response: BaseResponseDto<ChannelCitizen> = {
      message: "",
      success: false
    } 
    try {
      const channelRoomInformation = await this.channelRoomRepository.findOne({
        where: {
          id: channelRoomId
        },
        include:[
          {
            model: ChannelCitizen,
            required: true 
          }
        ],
        throwIfNotFound: false       
      })

      if(channelRoomInformation){
        response.data = channelRoomInformation.get('citizen').toJSON() as ChannelCitizen;
        response.message = "Datos del ciudadano";
        response.success = true;
      }
      return response;
    } catch (error) {
      response.error = error.toString();
      this.logger.error(error.toString())
      return response;
    }
  }
}
