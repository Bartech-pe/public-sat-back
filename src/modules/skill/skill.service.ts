import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillRepository } from './repositories/skill.repository';
import { SkillUserRepository } from './repositories/skill-user.repository';
import { Skill } from './entities/skill.entity';
import { User } from '@modules/user/entities/user.entity';
import { CreateSkillUserDto } from './dto/create-skill-user.dto';
import { SkillUser } from './entities/skill-user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Op } from 'sequelize';

@Injectable()
export class SkillService {
  constructor(
    private readonly repository: SkillRepository,
    private readonly skillUserRepository: SkillUserRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Skill>> {
    try {
      return this.repository.findAndCountAll({
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

  async findOne(id: number): Promise<Skill> {
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

  async create(dto: CreateSkillDto): Promise<Skill> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateSkillDto[]): Promise<Skill[]> {
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
    dtoList: CreateSkillUserDto[],
  ): Promise<SkillUser[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );

      await this.skillUserRepository.bulkDestroy({
        where:
          dtoList.length != 0
            ? {
                userId: id,
                skillId: {
                  [Op.notIn]: dtoList.map((dto) => dto.skillId),
                },
              }
            : { userId: id },
      });

      if (dtoList.length === 0) {
        return [];
      }

      await this.skillUserRepository.bulkRestore({
        where: {
          userId: id,
          skillId: {
            [Op.in]: dtoList.map((dto) => dto.skillId),
          },
        },
      });

      return this.skillUserRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['score'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(id: number, dto: UpdateSkillDto): Promise<Skill> {
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

  async toggleStatus(id: number): Promise<Skill> {
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
