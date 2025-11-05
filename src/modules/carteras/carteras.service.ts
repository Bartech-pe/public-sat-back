import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCarteraDto } from './dto/create-cartera.dto';
import { UpdateCarteraDto } from './dto/update-cartera.dto';
import { Cartera } from './entities/cartera.entity';
import { CarteraRepository } from './repositories/cartera.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { Oficina } from '@modules/oficina/entities/oficina.entity';
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';

@Injectable()
export class CarteraService {
  constructor(private readonly repository: CarteraRepository) {}

  ///private readonly CarteraDetalleRepository: CarteraDetalleRepository

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Cartera>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: Oficina }, { model: User, as: 'createdByUser' }],
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

  async findOne(id: number): Promise<Cartera> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
        include: [{ model: Oficina }, { model: User, as: 'createdByUser' }],
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

  async create(dto: CreateCarteraDto): Promise<Cartera> {
    try {
      // 1. Crear la cartera (sin detalles)
      const { detalles, ...restoDto } = dto;
      console.log(dto)

      return this.repository.create(
        {
          ...restoDto,
          detalles: detalles.map((d) => d as CarteraDetalle),
        },
        {
          include: [
            {
              model: CarteraDetalle,
            },
          ],
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: Partial<Cartera>[]): Promise<Cartera[]> {
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

  async update(id: number, dto: UpdateCarteraDto): Promise<Cartera> {
    try {
      
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      if (dto.detalles && Array.isArray(dto.detalles)) {
          for (const detalleDto of dto.detalles) {
            if (detalleDto.estadoCaso === 'new') {
              await CarteraDetalle.create({ idCartera: id, ...detalleDto });
            } 
          }
      }

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<Cartera> {
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
