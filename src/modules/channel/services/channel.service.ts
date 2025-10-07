import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ChannelRepository } from '../repositories/channel.repository';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing Channels.
 *
 * This class provides business logic and delegates persistence operations
 * to the ChannelsRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class ChannelService {
  constructor(private readonly repository: ChannelRepository) {}

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
  ): Promise<PaginatedResponse<Channel>> {
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
   * @param id Channel identifier
   * @returns The channel entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<Channel> {
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
   * Creates a new channel.
   * @param dto Data Transfer Object containing the channel data
   * @returns The created Channel entity
   */
  async create(dto: CreateChannelDto): Promise<Channel> {
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
   * @returns Array of created Channel entities
   */
  async bulkCreate(dtoList: CreateChannelDto[]): Promise<Channel[]> {
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
   * @param id Channel identifier
   * @param dto Data to update
   * @returns The updated Channel entity
   */
  async update(id: number, dto: UpdateChannelDto): Promise<Channel> {
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
   * Toggles the status (active/inactive) of a channel.
   * @param id Channel identifier
   * @returns The updated Channel entity with toggled status
   */
  async toggleStatus(id: number): Promise<Channel> {
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
   * @param id Channel identifier
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
   * @param id Channel identifier
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
