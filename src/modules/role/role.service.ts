import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { RoleRepository } from './repositories/role.repository';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { Screen } from '@modules/screen/entities/screen.entity';
import { roleIdAdministrador } from '@common/constants/role.constant';

@Injectable()
export class RoleService {
  constructor(private readonly repository: RoleRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Role>> {
    try {
      const whereOpts =
        user.roleId == roleIdAdministrador
          ? {
              where: {
                status: true,
              },
            }
          : {
              where: {
                status: true,
                id: 3,
              },
            };
      return this.repository.findAndCountAll({
        ...whereOpts,
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

  async findOne(id: number): Promise<Role> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
        include: [
          // {
          //   model: Screen,
          //   through: { attributes: [] },
          //   required: false,
          // },
        ],
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

  async create(dto: CreateRoleDto): Promise<Role> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateRoleDto[]): Promise<Role[]> {
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

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
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

  async toggleStatus(id: number): Promise<Role> {
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

  async getScreenByIdAndScreen(id: number, officeId: number, path: string) {
    const result = await this.repository.findOne({
      where: { id, status: true },
      include: [
        {
          model: Screen,
          where: { status: true },
          through: {
            attributes: ['canRead', 'canCreate', 'canUpdate', 'canDelete'],
          },
          include: [{ model: Screen, as: 'parent' }],
          required: false,
        },
      ],
      throwIfNotFound: false,
    });

    const role: Role | undefined = result ? result.toJSON() : undefined;
    const screenSelected: any = role?.screens?.find((s) => s.path === path);
    const allChildren = role?.screens?.filter(
      (s) => s.parentId === screenSelected?.id,
    );
    const readableChildren = allChildren?.filter(
      (c: any) => c.RoleScreenOffice?.canRead,
    );

    return {
      canAccess: !!screenSelected?.RoleScreenOffice?.canRead,
      screen: screenSelected,
      child: readableChildren?.[0] ?? null,
    };
  }

  async getScreensByRoleAndOffice(
    roleId: number,
    officeId: number,
  ): Promise<any[]> {
    const result = await this.repository.findOne({
      where: { id: roleId, status: true },
      include: [
        {
          model: Screen,
          where: { status: true },
          through: {
            attributes: [
              'officeId',
              'canRead',
              'canCreate',
              'canUpdate',
              'canDelete',
            ],
            where: { officeId },
          },
          required: false,
        },
      ],
      throwIfNotFound: false,
    });

    const role: Role | undefined = result ? result.toJSON() : undefined;
    const screens = role?.screens ?? [];

    return screens
      .filter((item: any) => !item.parentId && item?.RoleScreenOffice?.canRead)
      .map((item) => ({
        ...item,
        items: screens.filter(
          (s: any) => s.parentId === item.id && s?.RoleScreenOffice?.canRead,
        ),
      }));
  }
}
