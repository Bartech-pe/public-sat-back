import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAutomaticMessageDto } from './dto/create-automatic-message.dto';
import { UpdateAutomaticMessageDto } from './dto/update-automatic-message.dto';
import { AutomaticMessageRepository } from './repositories/automatic-message.repository';
import { AutomaticMessage } from './entities/automatic-message.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing Automatic Messages.
 *
 * This class provides business logic and delegates persistence operations
 * to the AutomaticMessageRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class AutomaticMessageService {
  constructor(private readonly repository: AutomaticMessageRepository) {}

  /**
   * Retrieves a paginated list of automatic messages.
   *
   * @param user Current authenticated user
   * @param limit Max number of records per page
   * @param offset Number of records to skip (for pagination)
   * @param q Optional query filters
   * @returns PaginatedResponse containing automatic messages
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<AutomaticMessage>> {
    try {
      return this.repository.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']], // Most recent first
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Retrieves a single automatic message by its ID.
   *
   * @param id AutomaticMessage ID
   * @throws NotFoundException if not found
   * @returns AutomaticMessage instance
   */
  async findOne(id: number): Promise<AutomaticMessage> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Automatic message not found');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates a new automatic message.
   *
   * @param dto Data Transfer Object containing creation data
   * @returns The created AutomaticMessage instance
   */
  async create(dto: CreateAutomaticMessageDto): Promise<AutomaticMessage> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates multiple automatic messages in bulk.
   *
   * @param dtoList List of creation DTOs
   * @returns List of created AutomaticMessage instances
   */
  async bulkCreate(
    dtoList: CreateAutomaticMessageDto[],
  ): Promise<AutomaticMessage[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );
      return this.repository.bulkCreate(securedDtoList, {});
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Updates an existing automatic message.
   *
   * @param id AutomaticMessage ID
   * @param dto Data Transfer Object containing updated data
   * @returns Updated AutomaticMessage instance
   */
  async update(
    id: number,
    dto: UpdateAutomaticMessageDto,
  ): Promise<AutomaticMessage> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Toggles the status (active/inactive) of an automatic message.
   *
   * @param id AutomaticMessage ID
   * @returns AutomaticMessage instance with updated status
   */
  async toggleStatus(id: number): Promise<AutomaticMessage> {
    try {
      const exist = await this.repository.findById(id);

      const status = !exist.get().status;

      exist.update({ status });

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Soft deletes an automatic message by ID.
   *
   * @param id AutomaticMessage ID
   */
  remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Restores a previously soft-deleted automatic message.
   *
   * @param id AutomaticMessage ID
   */
  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
