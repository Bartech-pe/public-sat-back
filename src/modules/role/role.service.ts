import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { RoleRepository } from './repositories/role.repository';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleScreenDto } from './dto/create-role-screen.dto';
import { RoleScreen } from './entities/role-screen.entity';
import { RoleScreenRepository } from './repositories/role-screen.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Screen } from '@modules/screen/entities/screen.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly roleScreenRepository: RoleScreenRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Role>> {
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
          {
            model: Screen,
            through: { attributes: [] },
            required: false,
          },
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

  async assignment(
    id: number,
    dtoList: CreateRoleScreenDto[],
  ): Promise<RoleScreen[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList
          .sort((a, b) => a.idScreen - b.idScreen)
          .map(async (dto) => ({
            ...dto,
          })),
      );
      return this.roleScreenRepository.bulkCreate(securedDtoList, {
        updateOnDuplicate: ['canRead', 'canCreate', 'canUpdate', 'canDelete'],
        individualHooks: true,
        ignoreDuplicates: true,
      });
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

  async getScreenByIdAndScreen(id: number, url: string) {
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
    const screenSelected: any = role?.screens?.find((s) => s.url === url);
    const allChildren = role?.screens?.filter(
      (s) => s.idParent === screenSelected?.id,
    );
    const readableChildren = allChildren?.filter(
      (c: any) => c.RoleScreen?.canRead,
    );

    return {
      canAccess: !!screenSelected?.RoleScreen?.canRead,
      screen: screenSelected,
      child: readableChildren?.[0] ?? null,
    };
  }

  async getScreensByRole(id: number): Promise<any[]> {
    const result = await this.repository.findOne({
      where: { id, status: true },
      include: [
        {
          model: Screen,
          where: { status: true },
          through: {
            attributes: ['canRead', 'canCreate', 'canUpdate', 'canDelete'],
          },
          required: false,
        },
      ],
      throwIfNotFound: false,
    });

    const role: Role | undefined = result ? result.toJSON() : undefined;
    const screens = role?.screens ?? [];
    return screens
      .filter((item: any) => !item.idParent && item?.RoleScreen?.canRead)
      .map((item) => ({
        ...item,
        items: screens.filter(
          (s: any) => s.idParent === item.id && s?.RoleScreen?.canRead,
        ),
      }));
  }
}
