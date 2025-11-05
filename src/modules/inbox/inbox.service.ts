import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InboxRepository } from './repositories/inbox.repository';
import { Inbox } from './entities/inbox.entity';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';
import { CreateInboxUserDto } from './dto/create-inbox-user.dto';
import { InboxUser } from './entities/inbox-user.entity';
import { User } from '@modules/user/entities/user.entity';
import { InboxUserRepository } from './repositories/inbox-user.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { col, fn, Op, where } from 'sequelize';
import { Channel } from '@modules/channel/entities/channel.entity';
import { InboxCredentialRepository } from './repositories/inbox-credential.repository';
import { CreateInboxCredentialDto } from './dto/create-inbox-credential.dto';
import { InjectModel } from '@nestjs/sequelize';
import { InvalidateInboxCredentialDto } from './dto/invalidate-inbox-credentials.dto';
import { InboxCredential } from './entities/inbox-credential.entity';
import { VicidialCredential } from '@modules/vicidial/entities/vicidial-credentials.entity';
import { EmailStateEnum } from '@modules/email/enum/email-state.enum';
import { ChannelStateEnum } from '@common/enums/channel-state.enum';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';
import { CategoryChannelRepository } from '@modules/channel/repositories/category-channel.repository';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';
import { ChannelStateRepository } from '@modules/channel-state/repositories/channel-state.repository';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { ChannelMultichannelCategory, chatSatAvailableStateId, wspAvailableStateId } from '@common/constants/channel.constant';
import { AvailableEnumToCategory, UnavailableEnumToCategory } from '@common/enums/channel.enum';
import { x } from 'joi';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { response } from 'express';


// CategoryChannelEnum
@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(
    private readonly repository: InboxRepository,
    private readonly categoryChannelRepository: CategoryChannelRepository,
    private readonly channelStateRepository: ChannelStateRepository,
    private readonly inboxCredentialRepository: InboxCredentialRepository,
    private readonly inboxUserRepository: InboxUserRepository,
    @InjectModel(InboxUser) private readonly inboxUser: typeof InboxUser,
  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Inbox>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: Channel }, { model: InboxCredential }, { model: VicidialCredential }, {model: User, as: 'users', through: { attributes: [] }}],
        limit,
        offset,
        order: [['id', 'DESC']],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<Inbox> {
    try {
      const exist = await this.repository.findById(id, {
        where: { id: id },
        include: [{ model: User, as: 'users', through: { attributes: [] } }],
      });
      if (!exist) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async create(dto: CreateInboxDto): Promise<Inbox> {
    try {
      let inboxCreated = await this.repository.create(dto);

      const inboxCredential: CreateInboxCredentialDto = {
        inboxId: inboxCreated.id,
        phoneNumber: dto.phoneNumber?.toString(),
        accessToken: dto.accessToken,
        businessId: dto.businessId,
        phoneNumberId: dto.phoneNumberId,
        expiresAt: dto.expiresAt,
      };
      await this.inboxCredentialRepository.create(inboxCredential);

      return inboxCreated;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateInboxDto[]): Promise<Inbox[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );
      return this.repository.bulkCreate(securedDtoList);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async assignment(
    id: number,
    dtoList: CreateInboxUserDto[],
  ): Promise<InboxUser[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(
          async (dto) =>
            ({
              ...dto,
              channelStateId: ChannelStateEnum.OFFLINE,
            }) as InboxUser,
        ),
      );

      await this.inboxUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                inboxId: id,
                userId: {
                  [Op.notIn]: dtoList.map((dto) => dto.userId),
                },
              }
            : { inboxId: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.inboxUserRepository.bulkRestore({
        where: {
          inboxId: id,
          userId: {
            [Op.in]: dtoList.map((dto) => dto.userId),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['channelStateId'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async assignmentByUser(
    id: number,
    dtoList: CreateInboxUserDto[],
  ): Promise<InboxUser[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
          channelStateId: ChannelStateEnum.OFFLINE,
        })),
      );

      await this.inboxUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                userId: id,
                inboxId: {
                  [Op.notIn]: dtoList.map((dto) => dto.inboxId),
                },
              }
            : { userId: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.inboxUserRepository.bulkRestore({
        where: {
          userId: id,
          inboxId: {
            [Op.in]: dtoList.map((dto) => dto.inboxId),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['channelStateId'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findByAssignmentId(userId: number): Promise<InboxUser[]> {
    const detalles = await this.inboxUserRepository.findAll({
      where: { userId: userId },
      include: [
        {
          model: Inbox,
          as: 'inbox',
        },
      ],
    });
    return detalles;
  }

  async assignmentSupervisor(
    userId: number,
    dtoList: CreateInboxUserDto[],
  ): Promise<InboxUser[]> {
    try {
      const inboxIds = dtoList.map((dto) => dto.inboxId);
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );

      await this.inboxUserRepository.bulkRestore({
        where: {
          userId: userId,
          inboxId: { [Op.in]: inboxIds },
        },
      });

      await this.inboxUserRepository.bulkDestroy({
        where: {
          userId: userId,
          inboxId: {
            [Op.notIn]: dtoList.map((dto) => dto.inboxId),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(
        securedDtoList,
        {
          updateOnDuplicate: ['channelStateId'],
        },
        {
          where: {
            userId: userId,
            inboxId: {
              [Op.in]: dtoList.map((dto) => dto.inboxId),
            },
          },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(id: number, dto: UpdateInboxDto): Promise<Inbox> {
    try {
      const inbox = await this.repository.findById(id);

      if (!inbox) {
        throw new NotFoundException(`Inbox con ID ${id} no encontrada`);
      }
      await inbox.update(dto);

      const hasCredentialFields =
        dto.accessToken ||
        dto.businessId ||
        dto.phoneNumber ||
        dto.phoneNumberId ||
        dto.expiresAt;

      if (hasCredentialFields) {
        const credential = await this.inboxCredentialRepository.findById(id);

        if (credential) {
          await credential.update({
            accessToken: dto.accessToken,
            businessId: dto.businessId,
            phoneNumber: dto.phoneNumber,
            phoneNumberId: dto.phoneNumberId,
            expiresAt: dto.expiresAt,
          });
        } else {
          // Si no hay credencial, podrías crearla opcionalmente
          await this.inboxCredentialRepository.create({
            inboxId: id,
            accessToken: dto.accessToken,
            businessId: dto.businessId,
            phoneNumber: dto.phoneNumber,
            phoneNumberId: dto.phoneNumberId,
            expiresAt: dto.expiresAt,
          });
        }
      }

      return inbox;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<Inbox> {
    try {
      const exist = await this.repository.findById(id);

      const status = !exist.get().status;

      exist.update({ status });

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async getUserStatus(currentUser: User, channel: string): Promise<BaseResponseDto<{ userStatus: string, color?: string | null }>> {
    try {
      const userId = Number(currentUser.id);
      const availableChannelStates = [chatSatAvailableStateId, wspAvailableStateId];
      const inboxOfUser = await this.inboxUserRepository.findAll({
        include: [
          {
            model: Inbox,
            required: true,
            include: [
              {
                model: Channel,
                required: true,
                where: channel == 'all' ? {}:{
                  name: channel
                }
              },
            ],
          },
          {
            model: ChannelState,
            required: true,
          },
        ],
        where: { userId },
      });
      if(!inboxOfUser.length)
      {
        return{
          message: 'Estado general para este usuario.',
          success: true,
          data: { userStatus: "Fuera de Línea", color: "484848ff" },
        };
      }
      const inboxOfUserParsed: InboxUser[] = inboxOfUser.map(x => x.toJSON())
  
      const userStatus = channel == 'all' ?  
        inboxOfUserParsed.some(x => availableChannelStates.includes(x?.channelState?.id??'')) ? "Disponible":"Fuera de Línea"
      :
        inboxOfUserParsed[0].channelState.id.toString();
      const color = inboxOfUserParsed[0].channelState.color 
      return {
        message: 'Estado general para este usuario.',
        success: true,
        data: { 
          userStatus: userStatus,
          color: color
        },
      };
    } catch (error) {
      return{
        message: 'Error de servidor.',
        success: false,
        data: { userStatus: "Fuera de Línea", color: "#484848ff" },
      };    
    }
  }


  async changeAllUserStatus(
      currentUser: User,
      payload: {
        channel: string,
        isAvailable?: boolean | null,
        channelStateId?: number | null,
      }
    ): Promise<BaseResponseDto> {
      const response: BaseResponseDto = {
        success: false,
        message: '',
      };

      try {
        const inboxOfUser = await this.inboxUserRepository.findAll({
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
              model: ChannelState,
              required: true,
            },
          ],
          where: {
            userId: currentUser.id,
          },
        });
        const inboxUserFiltered = inboxOfUser.filter((inboxUser) => {
          const inbox = inboxUser.get('inbox') as Inbox;
          const channel = inbox.get('channel').toJSON() as Channel;
          const channelState = inboxUser.get('channelState').toJSON() as ChannelState;
          if (payload.channel === 'all') {
            return channel.name !== ChannelType.TELEGRAM;
          }else{
            return channelState.categoryId === ChannelMultichannelCategory[payload.channel];
          }
        });

        for (const inboxUser of inboxUserFiltered) {
          const inbox = inboxUser.get('inbox') as Inbox;
          const channel = inbox.get('channel').toJSON() as Channel;
          if(payload.channel == 'all')
          {
            const newState = payload.isAvailable ? AvailableEnumToCategory[channel.id] : UnavailableEnumToCategory[channel.id];
            await inboxUser.update({ channelStateId: newState });
          }else{
            await inboxUser.update({ channelStateId: payload.channelStateId});
          }
        }

        response.message = '✅ Se ha hecho el cambio de estado para todos los canales.';
        response.success = true;
      } catch (error) {
        this.logger.error(error);
        response.message = '❌ No se ha podido cambiar el estado de todos los canales.';
        response.error = error.toString();
      }

      return response;
  }

  async getInboxAvailablesForUser (currentUser: User): Promise<BaseResponseDto<string[]>>
  {
    let response : BaseResponseDto<string[]> = {
      message: "",
      success: false
    }
    try {
      
      const inboxUser = (await this.inboxUserRepository.findAll(
        {
          where : {userId: currentUser.id},
          include: [
            {
              model: Inbox,
              required: true,
              include: [
                {
                  model: Channel,
                  required: true
                }
              ]
            }
          ] 
        }
      ))
      response.data = inboxUser.map((inboxUser: InboxUser) => {
        const inboxUserItem: InboxUser = inboxUser.toJSON()
        return inboxUserItem.inbox.channel.name
      })
      response.message = "Listado de canales accesibles";
      response.success = true
      return response
    } catch (error) {
      this.logger.error(error.toString())
      response.data = [];
      response.error = error.toString();
      return response;
    }
  }



  async remove(id: number): Promise<void> {
    try {
      await this.inboxUserRepository.bulkDestroy({
        where: {
          inboxId: id,
        },
      });
      const res = await this.repository.delete(id);

      return res;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async invalidateCredentials(payload: InvalidateInboxCredentialDto) {
    try {
      let inboxCredentials = await this.inboxCredentialRepository.findAll({
        where: {
          [Op.or]: [
            { accessToken: payload.accessToken },
            { phoneNumber: payload.phoneNumber },
          ],
        },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });
      if (!inboxCredentials.length) {
        throw new NotFoundException('No se halló la credencial a desactivar.');
      }
      const dateNow = new Date();
      this.inboxCredentialRepository.update(inboxCredentials[0].dataValues.id, {
        expiresAt: dateNow,
      });
    } catch (error) {
      throw error;
    }
  }
}
