import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstadoCampaniaDto } from './dto/create-estado-campania.dto';
import { UpdateEstadoCampaniaDto } from './dto/update-estado-campania.dto';
import { EstadoCampaniaRepository } from './repositories/estado-campania.repository';
import { EstadoCampania } from './entities/estado-campania.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class EstadoCampaniaService {
  constructor(private readonly repository: EstadoCampaniaRepository) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<EstadoCampania>> {
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

  async findOne(id: number): Promise<EstadoCampania> {
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

  async create(dto: CreateEstadoCampaniaDto): Promise<EstadoCampania> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(
    id: number,
    dto: UpdateEstadoCampaniaDto,
  ): Promise<EstadoCampania> {
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

}
