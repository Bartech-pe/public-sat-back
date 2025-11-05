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

  async findAllByRol(id: string): Promise<Screen[]> {
    const modulos = await this.repository.findAll({
      include: [
        {
          model: Role,
          where: { id: id },
          through: { attributes: ['canRead', 'canCreate', 'canUpdate', 'canDelete'] },
          required: false,
        },
      ],
      raw: false,
    });

    return modulos;

    // return modulos.map((modulo) => {
    //   const { roles, ...x } = modulo.toJSON();
    //   const rol = roles?.[0];

    //   const permisos = {
    //     idRol,
    //     idModulo: modulo.id,
    //     leer: false,
    //     crear: false,
    //     editar: false,
    //     eliminar: false,
    //   };
    //   if (rol) {
    //     permisos.leer = rol['PermisoRol'].leer;
    //     permisos.crear = rol['PermisoRol'].crear;
    //     permisos.editar = rol['PermisoRol'].editar;
    //     permisos.eliminar = rol['PermisoRol'].eliminar;
    //   }

    //   return {
    //     ...x,
    //     rol,
    //     permisos,
    //   };
    // });
  }
}
