import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ConsultTypeRepository } from './repositories/consult-type.repository';
import { ConsultType } from './entities/consult-type.entity';
import { CreateConsultTypeDto } from './dto/create-consult-type.dto';
import { UpdateConsultTypeDto } from './dto/update-consult-type.dto';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing ConsultTypes.
 *
 * This class provides business logic and delegates persistence operations
 * to the ConsultTypesRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class ConsultTypeService {
  constructor(private readonly repository: ConsultTypeRepository) {}

  /**
   * Retrieves a paginated list of ConsultTypes.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing ConsultTypes
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<ConsultType>> {
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

  /**
   * Finds a ConsultType by its ID.
   * @param id ConsultType identifier
   * @returns The ConsultType entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<ConsultType> {
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

  /**
   * Creates a new ConsultType.
   * @param dto Data Transfer Object containing the ConsultType data
   * @returns The created ConsultType entity
   */
  async create(dto: CreateConsultTypeDto): Promise<ConsultType> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  /**
   * Creates multiple ConsultTypes in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created ConsultType entities
   */
  async bulkCreate(dtoList: CreateConsultTypeDto[]): Promise<ConsultType[]> {
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

  /**
   * Updates an existing ConsultType by ID.
   * @param id ConsultType identifier
   * @param dto Data to update
   * @returns The updated ConsultType entity
   */
  async update(id: number, dto: UpdateConsultTypeDto): Promise<ConsultType> {
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

  /**
   * Toggles the status (active/inactive) of a ConsultType.
   * @param id ConsultType identifier
   * @returns The updated ConsultType entity with toggled status
   */
  async toggleStatus(id: number): Promise<ConsultType> {
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

  /**
   * Deletes (soft delete) a ConsultType by its ID.
   * @param id ConsultType identifier
   * @returns void
   */
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

  /**
   * Restores a previously deleted ConsultType by its ID.
   * @param id ConsultType identifier
   * @returns void
   */
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
