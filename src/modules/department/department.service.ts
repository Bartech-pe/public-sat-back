import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DepartmentRepository } from './repositories/department.repository';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { UserRole } from '@common/constants/role.constant';
import { col, fn, literal, Op, Order, where } from 'sequelize';

@Injectable()
export class DepartmentService {
  constructor(private readonly repository: DepartmentRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<Department>> {
    try {
      const { orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();

      const whereOptions: any =
        user.roleId == UserRole.Adm
          ? {}
          : {
              id: user.office?.departmentId,
            };

      // Búsqueda por nombre o email (solo si hay texto)
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('Department.name')), {
            [Op.like]: `%${safeTerm}%`,
          }),
          where(fn('LOWER', col('Department.description')), {
            [Op.like]: `%${safeTerm}%`,
          }),
        ];
      }

      // Ordenamiento
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
        order,
      });
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<Department> {
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

  async create(dto: CreateDepartmentDto): Promise<Department> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateDepartmentDto[]): Promise<Department[]> {
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

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
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

  async toggleStatus(id: number): Promise<Department> {
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
