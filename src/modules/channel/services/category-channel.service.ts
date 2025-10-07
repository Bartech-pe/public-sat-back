import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CategoryChannelRepository } from '../repositories/category-channel.repository';
import { CategoryChannel } from '../entities/category-channel.entity';
import { CreateCategoryChannelDto } from '../dto/create-category-channel.dto';
import { UpdateCategoryChannelDto } from '../dto/update-category-channel.dto';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing CategoryChannels.
 *
 * This class provides business logic and delegates persistence operations
 * to the CategoryChannelsRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CategoryChannelService {
  constructor(private readonly repository: CategoryChannelRepository) {}

  /**
   * Retrieves a paginated list of channels.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing channels
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<CategoryChannel>> {
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
   * Finds a channel by its ID.
   * @param id CategoryChannel identifier
   * @returns The channel entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<CategoryChannel> {
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
   * Creates a new category-channel.
   * @param dto Data Transfer Object containing the channel data
   * @returns The created CategoryChannel entity
   */
  async create(dto: CreateCategoryChannelDto): Promise<CategoryChannel> {
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
   * Creates multiple channels in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created CategoryChannel entities
   */
  async bulkCreate(
    dtoList: CreateCategoryChannelDto[],
  ): Promise<CategoryChannel[]> {
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
   * Updates an existing channel by ID.
   * @param id CategoryChannel identifier
   * @param dto Data to update
   * @returns The updated CategoryChannel entity
   */
  async update(
    id: number,
    dto: UpdateCategoryChannelDto,
  ): Promise<CategoryChannel> {
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
   * Toggles the status (active/inactive) of a category-channel.
   * @param id CategoryChannel identifier
   * @returns The updated CategoryChannel entity with toggled status
   */
  async toggleStatus(id: number): Promise<CategoryChannel> {
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
   * Deletes (soft delete) a channel by its ID.
   * @param id CategoryChannel identifier
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
   * Restores a previously deleted channel by its ID.
   * @param id CategoryChannel identifier
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
