import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TeamRepository } from './repositories/team.repository';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { TeamUser } from './entities/team-user.entity';
import { User } from '@modules/user/entities/user.entity';
import { TeamUserRepository } from './repositories/team-user.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Op } from 'sequelize';

@Injectable()
export class TeamService {
  constructor(
    private readonly repository: TeamRepository,
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<Team>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: User, as: 'users', through: { attributes: [] } }],
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

  async findOne(id: number): Promise<Team> {
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

  async create(dto: CreateTeamDto): Promise<Team> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateTeamDto[]): Promise<Team[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );
      return this.repository.bulkCreate(securedDtoList, {});
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async assignment(
    id: number,
    dtoList: CreateTeamUserDto[],
  ): Promise<TeamUser[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );

      await this.teamUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                userId: id,
                teamId: {
                  [Op.notIn]: dtoList.map((dto) => dto.teamId),
                },
              }
            : { userId: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.teamUserRepository.bulkRestore({
        where: {
          userId: id,
          teamId: {
            [Op.in]: dtoList.map((dto) => dto.teamId),
          },
        },
      });

      return this.teamUserRepository.bulkCreate(securedDtoList, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<Team> {
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
