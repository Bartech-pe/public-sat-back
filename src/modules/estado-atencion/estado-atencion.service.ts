import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEstadoAtencionDto } from './dto/create-estado-atencion.dto';
import { UpdateEstadoAtencionDto } from './dto/update-estado-atencion.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EstadoAtencion } from './entities/estado-atencion.entity';
import { EstadoAtencionRepository } from './repositories/estado-atencion.repository';

@Injectable()
export class EstadoAtencionService {
  constructor(private readonly repository: EstadoAtencionRepository) {}
  
    async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<EstadoAtencion>> {
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
  
    async findOne(id: number): Promise<EstadoAtencion> {
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
  
    async create(dto: CreateEstadoAtencionDto): Promise<EstadoAtencion> {
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
      dto: UpdateEstadoAtencionDto,
    ): Promise<EstadoAtencion> {
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
 
  async findbyAtencionAbierta(){
    return await this.repository.findOne({where:{id:6}})
  }
   async findbyAtencionCerrada(){
    return await this.repository.findOne({where:{id:5}})
  }
  async findbyAtencionSinAsignacion(){
    return await this.repository.findOne({where:{id:7}})
  }
  async findbyAtencionPendiente(){
    return await this.repository.findOne({where:{id:8}})
  }
  async findbyAtencionEnLinea(){
    return await this.repository.findOne({where:{id:9}})
  }
  async findbyAtencionNoDeseado(){
    return await this.repository.findOne({where:{id:10}})
  }
}
