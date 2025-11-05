import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChannelSchedule } from './entities/channel-schedule.entity';
import { CreateChannelScheduleDto } from './dto/create-channel-schedule.dto';
import { UpdateChannelScheduleDto } from './dto/update-channel-schedule.dto';
import { ChannelScheduleRepository } from './repositories/channel-schedule.repository';
import { User } from '@modules/user/entities/user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { UserRole } from '@common/constants/role.constant';

@Injectable()
export class ChannelScheduleService {
  constructor(private readonly repository: ChannelScheduleRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<ChannelSchedule>> {
    try {
      const whereOpts =
        user.roleId == UserRole.Adm
          ? {
              where: {},
            }
          : {
              where: {
                id: user.office?.departmentId,
              },
            };
      return this.repository.findAndCountAll({
        ...whereOpts,
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

  async findOne(id: number): Promise<ChannelSchedule> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
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

  async create(dto: CreateChannelScheduleDto): Promise<ChannelSchedule> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  // async bulkCreate(dtoList: CreateChannelScheduleDto[]): Promise<ChannelSchedule[]> {
  //     try {
  //       const securedDtoList = await Promise.all(
  //         dtoList.map(async (dto) => ({
  //           ...dto,
  //         })),
  //       );
  //       return this.repository.bulkCreate(securedDtoList, {});
  //     } catch (error) {
  //       throw new InternalServerErrorException(
  //         error,
  //         'Error interno del servidor',
  //       );
  //     }
  // }

  async update(
    id: number,
    dto: UpdateChannelScheduleDto,
  ): Promise<ChannelSchedule> {
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

  async toggleStatus(id: number): Promise<ChannelSchedule> {
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
