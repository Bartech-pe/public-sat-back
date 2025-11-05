import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { OficinaRepository } from './repositories/oficina.repository';
import { Oficina } from './entities/oficina.entity';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Area } from '@modules/area/entities/area.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class OficinaService {
  constructor(private readonly repository: OficinaRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Oficina>> {
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
                idArea: user.oficina?.idArea,
              },
            };
      return this.repository.findAndCountAll({
        ...whereOpts,
        include: [
          {
            model: Area,
          },
        ],
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

  async findOne(id: number): Promise<Oficina> {
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

  async create(dto: CreateOficinaDto): Promise<Oficina> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateOficinaDto[]): Promise<Oficina[]> {
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

  async update(id: number, dto: UpdateOficinaDto): Promise<Oficina> {
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

  async toggleStatus(id: number): Promise<Oficina> {
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
