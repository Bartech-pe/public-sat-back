import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ChannelAssistanceRepository } from './repositories/channel-assistance.repository';
import { ChannelAssistance } from './entities/channel-assistance.entity';
import { CreateChannelAssistanceDto } from './dto/create-channel-assistance.dto';
import { UpdateChannelAssistanceDto } from './dto/update-channel-assistance.dto';
import { User } from '@modules/user/entities/user.entity';
import { CitizenRepository } from '@modules/citizen/repositories/citizen.repository';
import { Citizen } from '@modules/citizen/entities/citizen.entity';
import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';
import { CitizenContactRepository } from '@modules/citizen/repositories/citizen-contact.repository';

/**
 * Service layer for managing ChannelAssistances.
 *
 * This class provides business logic and delegates persistence operations
 * to the ChannelAssistancesRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class ChannelAssistanceService {
  constructor(
    private readonly repository: ChannelAssistanceRepository,
    private readonly citizenRepository: CitizenRepository,
    private readonly citizenContactRepository: CitizenContactRepository,
  ) {}

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
  ): Promise<PaginatedResponse<ChannelAssistance>> {
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
   * @param id ChannelAssistance identifier
   * @returns The citizen entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<ChannelAssistance> {
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
   * @returns The created ChannelAssistance entity
   */
  async create(dto: CreateChannelAssistanceDto): Promise<ChannelAssistance> {
    try {
      const citizen = await this.citizenRepository.findOrCreate(
        {
          tipDoc: dto.tipDoc,
          docIde: dto.docIde,
        },
        {
          tipDoc: dto.tipDoc,
          docIde: dto.docIde,
          name: dto.name,
        },
        { raw: true },
      );

      if (dto.contact) {
        const contact = await this.citizenContactRepository.findOrCreate(
          {
            tipDoc: dto.contact.tipDoc,
            docIde: dto.contact.docIde,
            contactType: dto.contact.contactType,
            value: dto.contact.value,
          },
          {
            tipDoc: dto.contact.tipDoc,
            docIde: dto.contact.docIde,
            contactType: dto.contact.contactType,
            value: dto.contact.value,
          },
          { raw: true },
        );
      }

      return this.repository.create({
        citizenId: citizen.id,
        categoryId: dto.categoryId,
        consultTypeCode: dto.consultTypeCode,
        detail: dto.detail,
        communicationId: dto.communicationId,
      });
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
   * @returns Array of created ChannelAssistance entities
   */
  async bulkCreate(
    dtoList: CreateChannelAssistanceDto[],
  ): Promise<ChannelAssistance[]> {
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
   * @param id ChannelAssistance identifier
   * @param dto Data to update
   * @returns The updated ChannelAssistance entity
   */
  async update(
    id: number,
    dto: UpdateChannelAssistanceDto,
  ): Promise<ChannelAssistance> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update({ detail: dto.detail });

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
   * @param id ChannelAssistance identifier
   * @returns The updated ChannelAssistance entity with toggled status
   */
  async toggleStatus(id: number): Promise<ChannelAssistance> {
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
   * @param id ChannelAssistance identifier
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
   * @param id ChannelAssistance identifier
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

  findByDocIde(docIde: string): Promise<ChannelAssistance[]> {
    try {
      return this.repository.findAll({
        include: [
          { model: Citizen, where: { docIde } },
          { model: CategoryChannel },
          { model: ConsultType, as: 'consultType' },
          { model: User, as: 'createdByUser' },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
