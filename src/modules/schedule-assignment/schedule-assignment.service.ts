import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import { CreateScheduleAssignmentDto } from './dto/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dto/update-schedule-assignment.dto';
import { ScheduleAssignmentRepository } from './repositories/schedule-assignment.repository';
import { User } from '@modules/user/entities/user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class ScheduleAssignmentService {


  constructor(private readonly repository: ScheduleAssignmentRepository) {}

    async findAll(
      user: User,
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<ScheduleAssignment>> {
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
                  id: user.oficina?.idArea,
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
  
    async findOne(id: number): Promise<ScheduleAssignment> {
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

  async create(dto: CreateScheduleAssignmentDto): Promise<ScheduleAssignment> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
  }
  
  // async bulkCreate(dtoList: CreateScheduleAssignmentDto[]): Promise<ScheduleAssignment[]> {
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



  async update(id: number, dto: UpdateScheduleAssignmentDto): Promise<ScheduleAssignment> {
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

  async toggleStatus(id: number): Promise<ScheduleAssignment> {
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
