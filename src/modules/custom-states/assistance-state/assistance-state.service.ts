import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssistanceStateDto } from './dto/create-assistance-state.dto';
import { UpdateAssistanceStateDto } from './dto/update-assistance-state.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { AssistanceState } from './entities/assistance-state.entity';
import { AssistanceStateRepository } from './repositories/assistance-state.repository';
import { User } from '@modules/user/entities/user.entity';
import { emailCategoryId } from '@common/constants/channel.constant';
import { MailStates } from '@common/enums/assistance-state.enum';
import { EmailAttentionRepository } from '@modules/email/repositories/email-attention.repository';
import { col, fn, Order, where } from 'sequelize';
import { Op } from 'sequelize';

/**
 * Service layer for managing Assistance Status.
 *
 * This class provides business logic and delegates persistence operations
 * to the AssistanceStateRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class AssistanceStateService {
  constructor(
    private readonly repository: AssistanceStateRepository,
    private readonly emailAttentionRepository: EmailAttentionRepository,
  ) {}

  /**
   *  Retrieves a paginated list of assistance status.
   * @param user The user requesting the assistance status
   * @param limit Maximum number of records to return
   * @param offset Starting point for pagination
   * @param q Optional filter object
   * @returns Paginated list of assistance status
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<AssistanceState>> {
    try {
            const { orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();
      const whereOptions: any = {};
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('AssistanceState.name')), {
            [Op.like]: `%${safeTerm}%`,
          }),
        ];
      }
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
        order,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  /**
   * Finds a assistance status by its ID.
   * @param id AssistanceState identifier
   * @throws NotFoundException if assistance status does not exist
   * @returns AssistanceState entity
   */
  async findOne(id: number): Promise<AssistanceState> {
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
   * Creates a new assistance status.
   * @param dto Data Transfer Object containing assistance status data
   * @returns Newly created assistance status
   */
  async create(dto: CreateAssistanceStateDto): Promise<AssistanceState> {
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
   * Creates multiple assistance status in bulk.
   * @param dtoList List of assistance status DTOs
   * @returns List of created assistance status
   */
  async bulkCreate(
    dtoList: CreateAssistanceStateDto[],
  ): Promise<AssistanceState[]> {
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
   * Updates an existing assistance status by its ID.
   * @param id AssistanceState identifier
   * @param dto Data to update
   * @returns Updated assistance status
   */
  async update(
    id: number,
    dto: UpdateAssistanceStateDto,
  ): Promise<AssistanceState> {
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
   * Toggles the "status" field of a assistance status (active/inactive).
   * @param id AssistanceState identifier
   * @returns Updated assistance status with new status
   */
  async toggleStatus(id: number): Promise<AssistanceState> {
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
   * Soft deletes a assistance status by its ID.
   * @param id AssistanceState identifier
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
   * Restores a previously deleted assistance status by its ID.
   * @param id AssistanceState identifier
   */
  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  async findByName(name: string) {
    return await this.repository.findOne({ where: { name } });
  }

  async getOpenMailState() {
    return await this.repository.findOne({ where: { id: MailStates.OPEN } });
  }

  async getClosedMailState() {
    return await this.repository.findOne({ where: { id: MailStates.CLOSED } });
  }

  async getUnassignedMailState() {
    return await this.repository.findOne({
      where: { id: MailStates.UNASSIGNED },
    });
  }

  async getPenddingMailState() {
    return await this.repository.findOne({
      where: { id: MailStates.PENDDING },
    });
  }

  async getAttentionMailState() {
    return await this.repository.findOne({
      where: { id: MailStates.ATTENTION },
    });
  }

  async getSpamMailState() {
    return await this.repository.findOne({ where: { id: MailStates.SPAM } });
  }

  /**
   * Retrieves a paginated list of channel status status.
   * @param user Current authenticated user
   * @returns PaginatedResponse containing channel status status
   */
  async findAllAssistanceStateEmail(
    user: User,
  ): Promise<(AssistanceState & { count: number })[]> {
    try {
      const states = await this.repository.findAll({
        where: {
          categoryId: emailCategoryId,
        },
        order: [['id', 'DESC']],
      });

      return await Promise.all(
        states.map(async (t) => {
          const count = await this.emailAttentionRepository.count({
            where: { assistanceStateId: t.id },
          });

          return {
            ...t.toJSON(), // todas las propiedades de AssistanceState
            count, // la nueva propiedad
          } as AssistanceState & { count: number };
        }),
      );
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
