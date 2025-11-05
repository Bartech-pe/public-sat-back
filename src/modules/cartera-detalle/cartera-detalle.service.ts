import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CarteraDetalleRepository } from './repositories/cartera-detalle.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CarteraDetalle } from './entities/cartera-detalle.entity';
import { User } from '@modules/user/entities/user.entity';
import { Cartera } from '@modules/carteras/entities/cartera.entity';
import { CreateCarteraDetalleDto } from './dto/create-cartera-detalle.dto';
import { UpdateCarteraDetalleDto } from './dto/update-cartera-detalle.dto';
import { ReasignCarteraDetalleDto } from './dto/reasign-cartera-detalle.dto';
import { InformacionCaso } from './entities/informacion-caso.entity';
import { InformacionCasoDto } from './dto/informacion-caso.dto';
import { InformacionCasoRepository } from './repositories/informacion-caso.repository';

@Injectable()
export class CarteraDetalleService {
  constructor(
    private readonly repository: CarteraDetalleRepository,
    private readonly infoCasoRepository: InformacionCasoRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<CarteraDetalle>> {
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

  async findByCarteraId(idCartera: number): Promise<CarteraDetalle[]> {
    const detalles = await this.repository.findAll({
      where: { idCartera: idCartera },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!detalles.length) {
      throw new NotFoundException(
        `No se encontraron detalles para la cartera ${idCartera}`,
      );
    }

    return detalles;
  }

  findByUserId(idUser: number): Promise<CarteraDetalle[]> {
    return this.repository.findAll({
      where: { idUser },
      include: [
        {
          model: Cartera,
          required: true,
        },
        {
          model: User,
          as: 'user',
        },
        { model: InformacionCaso },
      ],
    });
  }

  async findOne(id: number): Promise<CarteraDetalle> {
    try {
      const exist = await this.repository.findById(id);
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

  async create(dto: CreateCarteraDetalleDto): Promise<CarteraDetalle> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async createOrUpdateInfoCaso(
    idDetalle: number,
    dto: InformacionCasoDto,
  ): Promise<InformacionCaso> {
    try {
      const exist = await this.repository.findOne({
        where: { id: idDetalle },
        include: [{ model: InformacionCaso, required: true }],
      });
      if (exist?.get()) {
        return exist?.get().informacionCaso?.update(dto);
      }
      return this.infoCasoRepository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreateCarteraDetalleDto[],
  ): Promise<CarteraDetalle[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (item) => item),
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
    dto: UpdateCarteraDetalleDto,
  ): Promise<CarteraDetalle> {
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

  async toggleCarteraDetalle(id: number): Promise<CarteraDetalle> {
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

  async reasigUser(
    dtoList: ReasignCarteraDetalleDto[],
  ): Promise<CarteraDetalle[]> {
    try {
      const resultados: CarteraDetalle[] = [];

      for (const dto of dtoList) {
        const [affectedRows, [updatedRow]] = await this.repository.update(
          dto.id,
          { idUser: dto.idUser },
        );

        if (updatedRow) {
          resultados.push(updatedRow);
        }
      }

      return resultados;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
