import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';
import { ScreenRepository } from './repositories/screen.repository';
import { Screen } from './entities/screen.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Role } from '@modules/role/entities/role.entity';
import { Op } from 'sequelize';
import { IsNull } from 'sequelize-typescript';
import { Office } from '@modules/office/entities/office.entity';

@Injectable()
export class ScreenService {
  constructor(private readonly repository: ScreenRepository) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Screen>> {
    try {
      return this.repository.findAndCountAll({
        limit,
        offset,
        order: [['id', 'ASC']],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<Screen> {
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

  async create(dto: CreateScreenDto): Promise<Screen> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateScreenDto[]): Promise<Screen[]> {
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

  async update(id: number, dto: UpdateScreenDto): Promise<Screen> {
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

  async toggleStatus(id: number): Promise<Screen> {
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

  async findAllByOffice(officeId: string): Promise<Screen[]> {
    const modulos = await this.repository.findAll({
      where: { status: true },
      include: [
        {
          model: Role,
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
      raw: false,
    });

    return modulos;
  }

  async getScreensByRoleAndOffice(
    roleId: number,
    officeId: number,
  ): Promise<ScreenWithPermissions[]> {
    const fullAccess = {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    };

    const screens = await this.repository.findAll({
      where: {
        parentId: { [Op.is]: null },
        status: true,
      },
      include: [
        {
          model: Role,
          where: roleId !== 1 ? { id: roleId } : {},
          through: {
            attributes: [
              'officeId',
              'canRead',
              'canCreate',
              'canUpdate',
              'canDelete',
            ],
            where: roleId !== 1 ? { officeId } : {},
          },
          required: false,
        },
        {
          model: Screen,
          as: 'children',
          where: { status: true },
          required: false,
          include: [
            {
              model: Role,
              where: roleId !== 1 ? { id: roleId } : {},
              through: {
                attributes: [
                  'officeId',
                  'canRead',
                  'canCreate',
                  'canUpdate',
                  'canDelete',
                ],
                where: roleId !== 1 ? { officeId, canRead: true } : {},
              },
              required: false,
            },
          ],
        },
      ],
    });

    const transform = (screen: any): ScreenWithPermissions => {
      const base = {
        ...screen,
        RoleScreenOffice:
          roleId !== 1 ? screen.roles?.[0]?.RoleScreenOffice : fullAccess,
      };

      return {
        ...base,
        items: (screen.children || []).map((child: any) => transform(child)),
      };
    };

    return screens
      .map((s) => {
        const item = transform(s.toJSON());
        return {
          ...item,
          items: item.items.filter((c) => c.RoleScreenOffice?.canRead),
        };
      })
      .filter(
        (item) =>
          item.RoleScreenOffice?.canRead ||
          item.items.some((c) => c.RoleScreenOffice?.canRead),
      )
      .sort((a, b) => a.id - b.id);
  }

  async getScreenByIdAndScreen(roleId: number, officeId: number, path: string) {
    const fullAccess = {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    };

    const result = await this.repository.findOne({
      where: { path, status: true },
      include: [
        {
          model: Role,
          where: { ...(roleId !== 1 ? { id: roleId } : {}) },
          through: {
            attributes: [
              'officeId',
              'canRead',
              'canCreate',
              'canUpdate',
              'canDelete',
            ],
            where: { ...(roleId !== 1 ? { roleId, officeId } : {}) },
          },
          required: false,
        },
        {
          model: Screen,
          as: 'children',
          where: { status: true },
          include: [
            {
              model: Office,
              where: { ...(roleId !== 1 ? { id: officeId } : {}) },
              through: {
                attributes: [
                  'officeId',
                  'canRead',
                  'canCreate',
                  'canUpdate',
                  'canDelete',
                ],
                where: {
                  ...(roleId !== 1 ? { roleId, officeId, canRead: true } : {}),
                },
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
      throwIfNotFound: false,
    });

    const screenSelected: any = result?.toJSON();

    const allChildren = screenSelected?.children.filter((item) => {
      return roleId !== 1 ? item.offices.length != 0 : true;
    });

    return {
      canAccess:
        roleId !== 1
          ? screenSelected?.roles?.[0]?.RoleScreenOffice?.canRead ||
            allChildren.length != 0
          : true,
      screen: {
        ...screenSelected,
        RoleScreenOffice:
          roleId !== 1
            ? screenSelected?.roles?.[0]?.RoleScreenOffice
            : fullAccess,
      },
      child: allChildren?.[0] ?? null,
    };
  }

  private attachPermissions(screen: any, roleId: number, fullAccess: any) {
    return {
      ...screen,
      RoleScreenOffice:
        roleId !== 1 ? screen.roles?.[0]?.RoleScreenOffice : fullAccess,
    };
  }
}

interface ScreenWithPermissions {
  id: number;
  name: string;
  items: ScreenWithPermissions[];
  RoleScreenOffice: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}
