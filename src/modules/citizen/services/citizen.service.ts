import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CitizenRepository } from '../repositories/citizen.repository';
import { Citizen } from '../entities/citizen.entity';
import { CreateCitizenDto } from '../dto/create-citizen.dto';
import { UpdateCitizenDto } from '../dto/update-citizen.dto';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing Citizens.
 *
 * This class provides business logic and delegates persistence operations
 * to the CitizensRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CitizenService {
  constructor(private readonly repository: CitizenRepository) {}

  /**
   * Retrieves a paginated list of citizens.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing citizens
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<Citizen>> {
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
   * Finds a citizen by its ID.
   * @param id Citizen identifier
   * @returns The citizen entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<Citizen> {
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
   * Creates a new citizen.
   * @param dto Data Transfer Object containing the citizen data
   * @returns The created Citizen entity
   */
  async create(dto: CreateCitizenDto): Promise<Citizen> {
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
   * Creates multiple citizens in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created Citizen entities
   */
  async bulkCreate(dtoList: CreateCitizenDto[]): Promise<Citizen[]> {
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
   * Updates an existing citizen by ID.
   * @param id Citizen identifier
   * @param dto Data to update
   * @returns The updated Citizen entity
   */
  async update(id: number, dto: UpdateCitizenDto): Promise<Citizen> {
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
   * Toggles the status (active/inactive) of a citizen.
   * @param id Citizen identifier
   * @returns The updated Citizen entity with toggled status
   */
  async toggleStatus(id: number): Promise<Citizen> {
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
   * Deletes (soft delete) a citizen by its ID.
   * @param id Citizen identifier
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
   * Restores a previously deleted citizen by its ID.
   * @param id Citizen identifier
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
