import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderRepository } from './repositories/reminder.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Reminder } from './entities/reminder.entity';

/**
 * Service layer for managing Reminders.
 *
 * This class provides business logic and delegates persistence operations
 * to the ReminderRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class ReminderService {
  constructor(private readonly repository: ReminderRepository) {}

  /**
   * Retrieves a paginated list of reminders.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing reminders
   */
  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Reminder>> {
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
   * Finds a reminder by its ID.
   * @param id Reminder identifier
   * @returns The reminder entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<Reminder> {
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
   * Creates a new reminder.
   * @param dto Data Transfer Object containing the reminder data
   * @returns The created Reminder entity
   */
  async create(dto: CreateReminderDto): Promise<Reminder> {
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
   * Creates multiple reminders in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created Reminder entities
   */
  async bulkCreate(dtoList: CreateReminderDto[]): Promise<Reminder[]> {
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
   * Updates an existing reminder by ID.
   * @param id Reminder identifier
   * @param dto Data to update
   * @returns The updated Reminder entity
   */
  async update(id: number, dto: UpdateReminderDto): Promise<Reminder> {
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
   * Toggles the status (active/inactive) of a reminder.
   * @param id Reminder identifier
   * @returns The updated Reminder entity with toggled status
   */
  async toggleStatus(id: number): Promise<Reminder> {
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
   * Deletes (soft delete) a reminder by its ID.
   * @param id Reminder identifier
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
   * Restores a previously deleted reminder by its ID.
   * @param id Reminder identifier
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
