import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateTagsDto } from './dto/create-tag.dto';
import { UpdateTagsDto } from './dto/update-tag.dto';
import { TagsRepository } from './repositories/tags.repository';
import { Tags } from './entities/tag.entity';

import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class TagsService {
  constructor(private readonly repository: TagsRepository) {}
  
    async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<Tags>> {
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
  
    async findOne(id: number): Promise<Tags> {
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
  
    async create(dto: CreateTagsDto): Promise<Tags> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async bulkCreate(dtoList: CreateTagsDto[]): Promise<Tags[]> {
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
  
    async update(id: number, dto: UpdateTagsDto): Promise<Tags> {
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
  
    async toggleTags(id: number): Promise<Tags> {
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
