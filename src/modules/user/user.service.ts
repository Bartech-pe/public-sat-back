import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { CryptHelper } from '@common/helpers/crypt.helper';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Role } from '@modules/role/entities/role.entity';
import { Office } from '@modules/office/entities/office.entity';
import { VicidialUser } from './entities/vicidial-user.entity';
import { Skill } from '@modules/skill/entities/skill.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { Op } from 'sequelize';
import { VicidialUserRepository } from './repositories/vicidial-user.repository';
import { ChannelPhoneState } from '@common/enums/status-call.enum';
import { UserRole } from '@common/constants/role.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly vicidialUserRepository: VicidialUserRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<User>> {
    try {
      const officeId = q?.officeId;
      const whereOpts =
        user.roleId == UserRole.Adm
          ? {
              where: {
                ...(q?.byTransfer
                  ? {
                      id: {
                        [Op.ne]: user.id,
                      },
                    }
                  : {}),
              },
            }
          : {
              where: {
                roleId: {
                  ...(q?.byTransfer
                    ? { [Op.in]: [2, 3] }
                    : { [Op.gte]: user.roleId }),
                },
                ...(q?.byTransfer
                  ? {
                      id: {
                        [Op.ne]: user.id,
                      },
                    }
                  : {}),
              },
            };
      const whereOffice = officeId
        ? {
            id: officeId,
          }
        : user.roleId == UserRole.Adm
          ? {}
          : {
              id: user.officeId,
            };

      return this.repository.findAndCountAll({
        ...whereOpts,
        include: [
          {
            model: Role,
            attributes: ['name', 'id'],
          },
          {
            model: Office,
            where: whereOffice,
            required: officeId ? true : !!user.officeId,
          },
          {
            model: Inbox,
            through: {
              attributes: [],
            },
          },
          {
            model: VicidialUser,
          },
          { model: Skill, through: { attributes: [] }, required: false },
        ],
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

  async findAllRolId(roleId: number): Promise<User[]> {
    try {
      const detalles = await this.repository.findAll({
        where: { roleId },
        include: [
          {
            model: Inbox,
            as: 'inboxes',
          },
        ],
      });

      return detalles; // Devuelve el array, aunque esté vacío
    } catch (error) {
      // Puedes registrar el error o transformarlo si deseas
      console.error(`Error al buscar usuarios con rol ${roleId}:`, error);
      throw new Error(`Error al buscar usuarios con el rol ${roleId}`);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
        include: [
          {
            model: Skill,
            through: {
              attributes: ['score'],
            },
            required: false,
          },
          {
            model: Office,
            where: {},
            required: false,
          },
          {
            model: Inbox,
            through: {
              attributes: ['userId'],
            },
            required: false,
            include: [{ model: Channel }],
          },
          {
            model: VicidialUser,
          },
        ],
        throwIfNotFound: false,
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

  async create(dto: CreateUserDto): Promise<User> {
    try {
      dto.password = await CryptHelper.hashPassword(dto.password);
      const { vicidial, ...restoDto } = dto;

      const dataToCreate: any = { ...restoDto };

      if (vicidial) {
        dataToCreate.vicidial = {
          ...vicidial,
          channelStateId: ChannelPhoneState.OFFLINE,
        }; // No castees el tipo
      }

      return this.repository.create(dataToCreate, {
        include: [
          {
            model: VicidialUser,
          },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateUserDto[]): Promise<User[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (item) => {
          const { vicidial, ...dto } = item;
          return {
            ...dto,
            password: await CryptHelper.hashPassword(dto.password),
          };
        }),
      );
      return this.repository.bulkCreate(securedDtoList, {});
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    try {
      const exist = await this.repository.findById(id);

      if (dto.password) {
        dto.password = await CryptHelper.hashPassword(dto.password);
      }

      if (dto.vicidial) {
        const vUser = await this.vicidialUserRepository.findOne({
          where: { userId: id },
        });
        if (vUser) {
          await vUser?.update({
            ...dto.vicidial,
          });
        } else {
          await this.vicidialUserRepository.create({
            ...dto.vicidial,
            userId: id,
            channelStateId: ChannelPhoneState.OFFLINE,
          });
        }
      }

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<User> {
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

  remove(id: number): Promise<void> {
    try {
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
}
