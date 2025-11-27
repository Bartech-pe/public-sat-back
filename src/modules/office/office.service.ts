import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { OfficeRepository } from './repositories/office.repository';
import { Office } from './entities/office.entity';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { Department } from '@modules/department/entities/department.entity';
import { RoleScreenOfficeRepository } from './repositories/role-screen-office.repository';
import { CreateRoleScreenOfficeDto } from './dto/create-role-screen.dto';
import { RoleScreenOffice } from './entities/role-screen-office.entity';
import { UserRole } from '@common/constants/role.constant';
import { col, fn, literal, Order, where } from 'sequelize';
import { Op } from 'sequelize';

@Injectable()
export class OfficeService {
  constructor(
    private readonly repository: OfficeRepository,
    private readonly roleScreenOfficeRepository: RoleScreenOfficeRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<Office>> {
    try {
      const { orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();

      const whereOptions: any =
        user.roleId == UserRole.Adm
          ? {}
          : {
              id: user.officeId,
            };

      // Búsqueda por nombre o email (solo si hay texto)
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('Office.name')), {
            [Op.like]: `%${safeTerm}%`,
          }),
          where(fn('LOWER', col('Office.description')), {
            [Op.like]: `%${safeTerm}%`,
          }),
          literal(`LOWER(\`department\`.\`name\`) LIKE '%${safeTerm}%'`),
        ];
      }

      // Ordenamiento
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        include: [
          {
            model: Department,
          },
        ],
        subQuery: false,
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

  async findOne(id: number): Promise<Office> {
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

  async create(dto: CreateOfficeDto): Promise<Office> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateOfficeDto[]): Promise<Office[]> {
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

  async update(id: number, dto: UpdateOfficeDto): Promise<Office> {
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

  async assignment(
    id: number,
    dtoList: CreateRoleScreenOfficeDto[],
  ): Promise<RoleScreenOffice[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList
          .sort((a, b) => a.screenId - b.screenId)
          .map(async (dto) => ({
            ...dto,
          })),
      );
      return this.roleScreenOfficeRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['canRead', 'canCreate', 'canUpdate', 'canDelete'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<Office> {
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
