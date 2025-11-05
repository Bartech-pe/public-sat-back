import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { AreaRepository } from './repositories/area.repository';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Screen } from '@modules/screen/entities/screen.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class AreaService {
  constructor(private readonly repository: AreaRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Area>> {
    try {
      const whereOpts =
        user.idRole == 1
          ? {
              where: {
                status: true,
              },
            }
          : {
              where: {
                status: true,
                id: user.oficina?.idArea,
              },
            };
      return this.repository.findAndCountAll({
        ...whereOpts,
        limit,
        offset,
        order: [['id', 'DESC']],
      });
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<Area> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
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

  async create(dto: CreateAreaDto): Promise<Area> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateAreaDto[]): Promise<Area[]> {
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

  async update(id: number, dto: UpdateAreaDto): Promise<Area> {
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

  async toggleStatus(id: number): Promise<Area> {
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
