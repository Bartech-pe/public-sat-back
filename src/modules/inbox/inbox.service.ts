import {
  Injectable,
  InternalServerErrorException,
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
import { Op, where } from 'sequelize';
import { Channel } from '@modules/channel/entities/channel.entity';
import { InboxCredentialRepository } from './repositories/inbox-credential.repository';
import { CreateInboxCredentialDto } from './dto/create-inbox-credential.dto';
import { ChannelRoomRepository } from '@modules/multi-channel-chat/repositories/channel-room.repository';
import { InjectModel } from '@nestjs/sequelize';
import { ChannelRoom } from '@modules/multi-channel-chat/entities/channel-room.entity';
import { InvalidateInboxCredentialDto } from './dto/invalidate-inbox-credentials.dto';
import { InboxCredential } from './entities/inbox-credentials';
import { EstadoCanalRepository } from '@modules/estado-canal/repositories/estado-canal.repository';
import { MailCredentialRepository } from '@modules/gmail/repositories/mail-credential.repository';

@Injectable()
export class InboxService {
  constructor(
    private readonly repository: InboxRepository,
    private readonly inboxCredentialRepository: InboxCredentialRepository,
    private readonly inboxUserRepository: InboxUserRepository,
    private readonly stateChannelRepository: EstadoCanalRepository,
    private readonly mailCredentialService:MailCredentialRepository,
    // private readonly channelRoomRepository:ChannelRoomRepository,
   @InjectModel(InboxUser) private readonly inboxUser: typeof InboxUser,

  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Inbox>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: Channel }, { model: InboxCredential }],
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
        include: [{ model: User, through: { attributes: [] } }],
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
       const inboxChannel = await this.repository.findById(id)
      let stateChannelId: number | null = null;
      if (inboxChannel.toJSON().idChannel == 4) {
        stateChannelId = 12;
      }

      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
          ...(stateChannelId !== null ? { stateChannelId } : {}),
        })),
      );

      await this.inboxUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                idInbox: id,
                idUser: {
                  [Op.notIn]: dtoList.map((dto) => dto.idUser),
                },
              }
            : { idInbox: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.inboxUserRepository.bulkRestore({
        where: {
          idInbox: id,
          idUser: {
            [Op.in]: dtoList.map((dto) => dto.idUser),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['idInbox', 'idUser'],
        individualHooks: true,
        ignoreDuplicates: true,
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
      const inboxChannel = await this.repository.findById(id)
      let stateChannelId: number | null = null;
      if (inboxChannel.toJSON().idChannel == 4) {
        stateChannelId = 12;
      }

      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
          ...(stateChannelId !== null ? { stateChannelId } : {}),
        })),
      );

      await this.inboxUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                idUser: id,
                idInbox: {
                  [Op.notIn]: dtoList.map((dto) => dto.idInbox),
                },
              }
            : { idUser: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.inboxUserRepository.bulkRestore({
        where: {
          idUser: id,
          idInbox: {
            [Op.in]: dtoList.map((dto) => dto.idInbox),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['idInbox', 'idUser'],
        individualHooks: true,
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findByAssignmentId(idUser: number): Promise<InboxUser[]> {
    const detalles = await this.inboxUserRepository.findAll({
      where: { idUser: idUser },
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
    idUser: number,
    dtoList: CreateInboxUserDto[],
  ): Promise<InboxUser[]> {
    try {
      const inboxIds = dtoList.map(dto => dto.idInbox);
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );

      await this.inboxUserRepository.restoreSoftDeleted(idUser, inboxIds);

      await this.inboxUserRepository.bulkDestroy({
        where: {
          idUser: idUser,
          idInbox: {
            [Op.notIn]: dtoList.map((dto) => dto.idInbox),
          },
        },
      });

      return this.inboxUserRepository.bulkCreate(
        securedDtoList,
        {
          updateOnDuplicate: ['idInbox', 'idUser'],
          individualHooks: true,
          ignoreDuplicates: true,
        },
        {
          where: {
            idUser: idUser,
            idInbox: {
              [Op.in]: dtoList.map((dto) => dto.idInbox),
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

  async remove(id: number): Promise<void> {
    try {
      const exist = await this.repository.findById(id);
      if (exist) {
        const inboxId = exist.id;
        await this.inboxUserRepository.bulkDestroy({ where: { idInbox: inboxId } });
        await this.mailCredentialService.bulkDestroy({ where: { inboxId: inboxId } });
      }

      return this.repository.delete(id);

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
  
  async invalidateCredentials(payload: InvalidateInboxCredentialDto)
  {
    try {
      let inboxCredentials = await this.inboxCredentialRepository.findAll({
        where: {
          [Op.or]: [
            { accessToken: payload.accessToken },
            { phoneNumber: payload.phoneNumber }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 1	
      })
      if(!inboxCredentials.length){
        throw new NotFoundException("No se halló la credencial a desactivar.")
      }
      const dateNow = new Date();
      this.inboxCredentialRepository.update(inboxCredentials[0].dataValues.id, {
        expiresAt: dateNow
      })
    } catch (error) {
      throw error
    }
  }
  async changeAttentionAvaliable(inboxId:number,userId:number){
       const exist = await this.inboxUserRepository.findOne({ where: { idInbox: inboxId, idUser: userId } });
       if (!exist) throw new NotFoundException("No se halló la credencial ")
       const avalible = await this.stateChannelRepository.findAvalibleEmail();
       if (!avalible) throw new NotFoundException("No se halló la credencial ")
       const disable = await this.stateChannelRepository.findDisableEmail();
       if (!disable) throw new NotFoundException("No se halló la credencial ")
       const statusId = exist.toJSON().stateChannelId
       if(statusId == avalible.toJSON().id){
         return  await this.inboxUserRepository.changeAttention(inboxId,userId,disable.toJSON().id)
       }
        if(statusId == disable.toJSON().id){
         return  await this.inboxUserRepository.changeAttention(inboxId,userId,avalible.toJSON().id)
       }
       return {message:'Sin actulización'}
      
  }
}
