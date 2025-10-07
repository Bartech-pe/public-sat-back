import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTemplateEmailDto } from './dto/create-template-email.dto';
import { UpdateTemplateEmailDto } from './dto/update-template-email.dto';
import { TemplateEmailRepository } from './repositories/template-email.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { TemplateEmail } from './entities/template-email.entity';

@Injectable()
export class TemplateEmailService {

  constructor(private readonly repository: TemplateEmailRepository) { }

  async create(dto: CreateTemplateEmailDto): Promise<TemplateEmail> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateTemplateEmailDto[]): Promise<TemplateEmail[]> {
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

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<TemplateEmail>> {
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

  async findOne(id: number): Promise<TemplateEmail> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('plantilla no encontrado');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(id: number, dto: UpdateTemplateEmailDto): Promise<TemplateEmail> {
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

  async toggleTag(id: number): Promise<TemplateEmail> {
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
