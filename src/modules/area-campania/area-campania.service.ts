import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAreaCampaniaDto } from './dto/create-area-campania.dto';
import { UpdateAreaCampaniaDto } from './dto/update-area-campania.dto';
import { AreaCampaniaRepository } from './repositories/area-campania.repository';
import { AreaCampaniaResponse } from './entities/area-campania.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class AreaCampaniaService {
   
  constructor(private readonly repository: AreaCampaniaRepository) {}
  
    async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<AreaCampaniaResponse>> {
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
  
    async findOne(id: number): Promise<AreaCampaniaResponse> {
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
  
    async create(dto: CreateAreaCampaniaDto): Promise<AreaCampaniaResponse> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async bulkCreate(
      dtoList: CreateAreaCampaniaDto[],
    ): Promise<AreaCampaniaResponse[]> {
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
  
    async update(
      id: number,
      dto: UpdateAreaCampaniaDto,
    ): Promise<AreaCampaniaResponse> {
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
  
    async toggleAreaCampaniaResponse(id: number): Promise<AreaCampaniaResponse> {
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
