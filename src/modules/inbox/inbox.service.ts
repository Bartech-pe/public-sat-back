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
import { Op } from 'sequelize';
import { Channel } from '@modules/channel/entities/channel.entity';
import { InboxCredentialRepository } from './repositories/inbox-credential.repository';
import { CreateInboxCredentialDto } from './dto/create-inbox-credential.dto';
import { InjectModel } from '@nestjs/sequelize';
import { InvalidateInboxCredentialDto } from './dto/invalidate-inbox-credentials.dto';
import { InboxCredential } from './entities/inbox-credential.entity';

@Injectable()
export class InboxService {
  constructor(
    private readonly repository: InboxRepository,
    private readonly inboxCredentialRepository: InboxCredentialRepository,
    private readonly inboxUserRepository: InboxUserRepository,
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
        dtoList.map(async (dto) => ({
          ...dto,
        })),
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
