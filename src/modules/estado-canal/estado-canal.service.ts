import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EstadoCanalRepository } from './repositories/estado-canal.repository';
import { EstadoCanal } from './entities/estado-canal.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CreateEstadoCanalDto } from './dto/create-estado-canal.dto';
import { UpdateEstadoCanalDto } from './dto/update-estado-canal.dto';


@Injectable()
export class EstadoCanalService {
  constructor(private readonly repository: EstadoCanalRepository) {}
  
    async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<EstadoCanal>> {
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
  
    async findOne(id: number): Promise<EstadoCanal> {
      try {
        const exist = await this.repository.findById(id);
        if (!exist) {
          throw new NotFoundException('Estado no encontrado');
        }
        return exist;
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async create(dto: CreateEstadoCanalDto): Promise<EstadoCanal> {
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
      dto: UpdateEstadoCanalDto,
    ): Promise<EstadoCanal> {
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
