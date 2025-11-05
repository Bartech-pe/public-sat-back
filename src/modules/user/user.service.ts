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
import { Skill } from '@modules/skill/entities/skill.entity';
import { Oficina } from '@modules/oficina/entities/oficina.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { UserVicidial } from './entities/user-vicidial.entity';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<User>> {
    try {
      const whereOpts =
        user.idRole == 1
          ? {
              where: {
                status: true,
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
                status: true,
                idRole: {
                  [Op.in]: q?.byTransfer ? [2, 3] : [3],
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
      const whereOficina =
        user.idRole == 1
          ? { status: true }
          : {
              id: user.idOficina,
            };

      return this.repository.findAndCountAll({
        ...whereOpts,
        include: [
          {
            model: Role,
            attributes: ['name'],
          },
          {
            model: Oficina,
            where: whereOficina,
            required: !!user.idOficina,
          },
          {
            model: Inbox,
            through: {
              attributes: [],
            },
          },
          {
            model: UserVicidial,
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

  async findAllRolId(idRole: number): Promise<User[]> {
    try {
      const detalles = await this.repository.findAll({
        where: { idRole },
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
      console.error(`Error al buscar usuarios con rol ${idRole}:`, error);
      throw new Error(`Error al buscar usuarios con el rol ${idRole}`);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const exist = await this.repository.findOne({
        where: { id, status: true },
        include: [
          {
            model: Skill,
            through: {
              attributes: ['score'],
            },
            required: false,
          },
          {
            model: Oficina,
            where: { status: true },
            required: false,
          },
          {
            model: Inbox,
            through: {
              attributes: ['idUser'],
            },
            required: false,
            include: [{ model: Channel }],
          },
          {
            model: UserVicidial,
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
        dataToCreate.vicidial = vicidial; // No castees el tipo
      }

      return this.repository.create(dataToCreate, {
        include: [
          {
            model: UserVicidial,
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

  // async assignment(
  //     id: number,
  //     dtoList: CreateTeamUserDto[],
  //   ): Promise<TeamUser[]> {
  //     try {
  //       const securedDtoList = await Promise.all(
  //         dtoList.map(async (dto) => ({
  //           ...dto,
  //         })),
  //       );
  //       return this.teamUserModel.bulkCreate(securedDtoList, {
  //         updateOnDuplicate: ['idTeam', 'idUser'],
  //         individualHooks: true,
  //         ignoreDuplicates: true,
  //       });
  //     } catch (error) {
  //       throw new InternalServerErrorException(
  //         error,
  //         'Error interno del servidor',
  //       );
  //     }
  //   }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    try {
      const exist = await this.repository.findById(id);

      if (dto.password) {
        dto.password = await CryptHelper.hashPassword(dto.password);
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
