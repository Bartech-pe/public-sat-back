import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Area } from '@modules/area/entities/area.entity';
import { User } from '@modules/user/entities/user.entity';
import { AtencionCiudadanoRepository } from './repositories/atencion-ciudadano.repository';
import { AtencionCiudadano } from './entities/atencion-ciudadano.entity';
import { CreateAtencionCiudadanoDto } from './dto/create-atencion-ciudadano.dto';
import { UpdateAtencionCiudadanoDto } from './dto/update-atencion-ciudadano.dto';
import { CarteraDetalleRepository } from '@modules/cartera-detalle/repositories/cartera-detalle.repository';
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';

@Injectable()
export class AtencionCiudadanoService {
  constructor(
    private readonly repository: AtencionCiudadanoRepository,
    private readonly carteraDetalleRepository: CarteraDetalleRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<AtencionCiudadano>> {
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

  async findOne(id: number): Promise<AtencionCiudadano> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
      });
      if (!exist) {
        throw new NotFoundException('Registro no encontrado');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findByCarteraDetalle(idCarteraDetalle: number): Promise<AtencionCiudadano[]> {
    try {
      return this.repository.findAll({
        where: { idCarteraDetalle, verifPago: false },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findVerificacionByCarteraDetalle(
    idCarteraDetalle: number,
  ): Promise<AtencionCiudadano[]> {
    try {
      return this.repository.findAll({
        where: { idCarteraDetalle, verifPago: true },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findByDocIde(docIde: string): Promise<AtencionCiudadano[]> {
    try {
      return this.repository.findAll({
        where: { docIde },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async create(dto: CreateAtencionCiudadanoDto): Promise<AtencionCiudadano> {
    try {
      const attention = this.repository.create(dto);
      if (dto.idCarteraDetalle) {
        const carteraDetalle = await this.carteraDetalleRepository.findById(
          dto.idCarteraDetalle,
        );
        if (!carteraDetalle.dataValues.status) {
          await this.carteraDetalleRepository.update(dto.idCarteraDetalle, {
            status: true,
          });
        }
      }

      return attention;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreateAtencionCiudadanoDto[],
  ): Promise<AtencionCiudadano[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => {
          return dto;
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

  async update(
    id: number,
    dto: UpdateAtencionCiudadanoDto,
  ): Promise<AtencionCiudadano> {
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

  async toggleStatus(id: number): Promise<AtencionCiudadano> {
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
      const atencion = await this.repository.findOne({
        where: {
          id,
        },
        include: [
          { model: CarteraDetalle, include: [{ model: AtencionCiudadano }] },
        ],
      });

      const carteraDetalle = atencion?.get().carteraDetalle;

      if (carteraDetalle) {
        const atenciones = carteraDetalle?.get().atenciones;
        if (atenciones.length == 1) {
          await carteraDetalle.update({ status: false });
        }
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
}
