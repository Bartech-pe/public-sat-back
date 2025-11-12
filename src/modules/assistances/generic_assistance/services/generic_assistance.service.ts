import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { GenericAssistanceRepository } from '../repositories/generic-assistance.repository';
import { GenericAssistance } from '../entities/generic-assistance.entity';
import { CreateGenericAssistanceDto } from '../dto/create-generic-assistance.dto';
import { UpdateGenericAssistanceDto } from '../dto/update-generic-assistance.dto';
import { User } from '@modules/user/entities/user.entity';
import { CitizenRepository } from '@modules/citizen/repositories/citizen.repository';
import { Citizen } from '@modules/citizen/entities/citizen.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';
import { CitizenContactRepository } from '@modules/citizen/repositories/citizen-contact.repository';
import { Office } from '@modules/office/entities/office.entity';
import { CitizenContact } from '@modules/citizen/entities/citizen-contact.entity';

/**
 * Service layer for managing GenericAssistances.
 *
 * This class provides business logic and delegates persistence operations
 * to the GenericAssistancesRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class GenericAssistanceService {
  constructor(
    private readonly repository: GenericAssistanceRepository,
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
  ): Promise<PaginatedResponse<GenericAssistance>> {
    try {
      const byUser = q?.byUser;
      return this.repository.findAndCountAll({
        include: [
          { model: Citizen },
          { model: Office },
          { model: CitizenContact },
          { model: ConsultType, as: 'consultType' },
          {
            model: User,
            as: 'createdByUser',
            where: byUser ? { id: user.id } : {},
            required: true,
          },
        ],
        distinct: true,
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
   * @param id GenericAssistance identifier
   * @returns The citizen entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<GenericAssistance> {
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
   * @returns The created GenericAssistance entity
   */
  async create(
    dto: CreateGenericAssistanceDto,
    officeId?: number,
  ): Promise<GenericAssistance> {
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
          isAdditional: dto.contact.isAdditional,
        },
        { raw: true },
      );

      return this.repository.create({
        citizenId: citizen.id,
        citizenContactId: contact.id,
        consultTypeCode: dto.consultTypeCode,
        detail: dto.detail,
        officeId: officeId,
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
   * @returns Array of created GenericAssistance entities
   */
  async bulkCreate(
    dtoList: CreateGenericAssistanceDto[],
  ): Promise<GenericAssistance[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dtoRes) => {
          const { contact, ...dto } = dtoRes;
          return {
            ...dto,
          };
        }),
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
   * @param id GenericAssistance identifier
   * @param dto Data to update
   * @returns The updated GenericAssistance entity
   */
  async update(
    id: number,
    dto: UpdateGenericAssistanceDto,
  ): Promise<GenericAssistance> {
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
   * @param id GenericAssistance identifier
   * @returns The updated GenericAssistance entity with toggled status
   */
  async toggleStatus(id: number): Promise<GenericAssistance> {
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
   * @param id GenericAssistance identifier
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
   * @param id GenericAssistance identifier
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

  findByDocIde(docIde: string): Promise<GenericAssistance[]> {
    try {
      return this.repository.findAll({
        include: [
          { model: Citizen, where: { docIde } },
          { model: Office },
          { model: CitizenContact },
          { model: ConsultType, as: 'consultType' },
          { model: User, as: 'createdByUser' },
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
