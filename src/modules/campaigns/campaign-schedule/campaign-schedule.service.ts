import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignScheduleDto } from './dto/create-campaign-schedule.dto';
import { UpdateCampaignScheduleDto } from './dto/update-campaign-schedule.dto';
import { CampaignScheduleRepository } from './repositories/campaign-schedule.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignSchedule } from './entities/campaign-schedule.entity';

@Injectable()
export class CampaignScheduleService {
  constructor(private readonly repository: CampaignScheduleRepository) {}

  async create(dto: CreateCampaignScheduleDto): Promise<CampaignSchedule> {
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
    dtoList: CreateCampaignScheduleDto[],
  ): Promise<CampaignSchedule[]> {
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
  ): Promise<PaginatedResponse<CampaignSchedule>> {
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

  async findOne(id: number): Promise<CampaignSchedule> {
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

  async update(
    id: number,
    dto: UpdateCampaignScheduleDto,
  ): Promise<CampaignSchedule> {
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

  async toggleTag(id: number): Promise<CampaignSchedule> {
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
