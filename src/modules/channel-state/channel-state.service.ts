import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChannelStateRepository } from './repositories/channel-state.repository';
import { ChannelState } from './entities/channel-state.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CreateChannelStateDto } from './dto/create-channel-state.dto';
import { UpdateChannelStateDto } from './dto/update-channel-state.dto';
import { User } from '@modules/user/entities/user.entity';
import { emailCategoryId } from '@common/constants/channel.constant';

/**
 * Service layer for managing ChannelState.
 *
 * This class provides business logic and delegates persistence operations
 * to the ChannelStateRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class ChannelStateService {
  constructor(private readonly repository: ChannelStateRepository) {}

  /**
   * Retrieves a paginated list of channel status status.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing channel status status
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<ChannelState>> {
    try {
      return this.repository.findAndCountAll({
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

  /**
   * Finds a channel status by its ID.
   * @param id Channel Status identifier
   * @returns The channel status status entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<ChannelState> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Estado no encontrado');
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
   * Creates a new channel status.
   * @param dto Data Transfer Object containing the channel status data
   * @returns The created Channel Status entity
   */
  async create(dto: CreateChannelStateDto): Promise<ChannelState> {
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
   * Creates multiple channel status status in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created Channel Status entities
   */
  async bulkCreate(dtoList: CreateChannelStateDto[]): Promise<ChannelState[]> {
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
   * Updates an existing channel status by ID.
   * @param id Channel Status identifier
   * @param dto Data to update
   * @returns The updated Channel Status entity
   */
  async update(id: number, dto: UpdateChannelStateDto): Promise<ChannelState> {
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
   * Toggles the status (active/inactive) of a channel status.
   * @param id Channel Status identifier
   * @returns The updated Channel Status entity with toggled status
   */
  async toggleStatus(id: number): Promise<ChannelState> {
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
   * Deletes (soft delete) a channel status by its ID.
   * @param id Channel Status identifier
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
   * Restores a previously deleted channel status by its ID.
   * @param id Channel Status identifier
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

  /**
   * Retrieves a paginated list of channel status status.
   * @param user Current authenticated user
   * @returns PaginatedResponse containing channel status status
   */
  async findAllChannelStateEmail(user: User): Promise<ChannelState[]> {
    try {
      return this.repository.findAll({
        where: {
          categoryId: emailCategoryId,
        },
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

  /**
   * Retrieves a paginated list of channel status status.
   * @param user Current authenticated user
   * @returns PaginatedResponse containing channel status status
   */
  async findMyChannelStateEmail(user: User): Promise<ChannelState | null> {
    try {
      return this.repository.findOne({
        where: {
          categoryId: emailCategoryId,
        },
        include: [
          {
            model: User,
            as: 'users',
            through: { attributes: [] },
            where: {
              id: user.id,
            },
          },
        ],
      });
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
