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
import { AutomaticMessageDescriptionRepository } from './repositories/automatic-message-description.repository';
import { AutomaticMessageDescription } from './entities/automatic-message-description.entity';
import { Op } from 'sequelize';

/**
 * Service layer for managing Automatic Messages.
 *
 * This class provides business logic and delegates persistence operations
 * to the AutomaticMessageRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class AutomaticMessageService {
  private welcomeMessagesId: number[] = [11, 12];

  constructor(
    private readonly repository: AutomaticMessageRepository,
    private readonly automaticMessageDescriptionRepository: AutomaticMessageDescriptionRepository
  ) {}

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
        include: [{ 
          model: AutomaticMessageDescription, 
          required: false,
          order: [['order', 'ASC']]
        }],
        limit,
        offset,
        order: [['id', 'DESC']],
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
      const exist = await this.repository.findOne({
        where: { id },
        include: [{ 
          model: AutomaticMessageDescription, 
          required: false,
          order: [['order', 'ASC']]
        }],
      });
      if (!exist) {
        throw new NotFoundException('Automatic message not found');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  public async getallAutomaticWelcomeMessagesFromChannel(categoryId: number): Promise<string[]>
  {
    const exist = (await this.automaticMessageDescriptionRepository.findAll({
        where: { 
          automaticMessageId: {
            [Op.in]: this.welcomeMessagesId
          },
        },
        include: [{ 
          model: AutomaticMessage, 
          required: true,
          where: {
            categoryId: categoryId
          }
        }],
      })).map(x => x.toJSON()?.description);
    return exist;
  }

  /**
   * Creates a new automatic message.
   *
   * @param dto Data Transfer Object containing creation data
   * @returns The created AutomaticMessage instance
   */
 async create(dto: CreateAutomaticMessageDto): Promise<AutomaticMessage> {
    try {
      // Crear el mensaje automático
      const automaticMessage = await this.repository.create(dto);

      // Crear las descripciones si existen
      if (dto.message_descriptions && dto.message_descriptions.length > 0) {
        for (const [index, description] of dto.message_descriptions.entries()) {
          await this.automaticMessageDescriptionRepository.create(
            {
              automaticMessageId: automaticMessage.id,
              description: description,
              order: index + 1,
              status: dto.status ?? true,
            }
          );
        }
      }

      return this.findOne(automaticMessage.id);
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

        // Actualizar el mensaje automático
        await exist.update(
          {
            name: dto.name,
            categoryId: dto.categoryId,
            status: dto.status,
          },
        );

        // Si vienen descripciones, actualizarlas
        if (dto.message_descriptions && dto.message_descriptions.length > 0) {
          await this.automaticMessageDescriptionRepository.bulkDestroy({where: {automaticMessageId: id}})
          // Crear las nuevas descripciones
          for (const [index, description] of dto.message_descriptions.entries()) {
            await this.automaticMessageDescriptionRepository.create(
              {
                automaticMessageId: id,
                description: description,
                order: index + 1,
                status: dto.status ?? true,
              },
            );
          }
        }

        return this.findOne(id);
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
  async remove(id: number): Promise<void> {
    try {
      await this.automaticMessageDescriptionRepository.bulkDestroy({
        where: { automaticMessageId: id} 
      });
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
  async restore(id: number): Promise<void> {
    try {
      await this.automaticMessageDescriptionRepository.bulkRestore({
        where: { automaticMessageId: id} 
      });
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
