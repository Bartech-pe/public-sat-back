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
import { CitizenContact } from '../entities/citizen-contact.entity';
import { ContactoDto } from '@modules/api-sat/omnicanalidad/dto/Contacto.dto';
import { CitizenContactRepository } from '../repositories/citizen-contact.repository';
import { Op } from 'sequelize';
import { CitizenContactDto } from '../dto/citizen-contact.dto';

/**
 * Service layer for managing Citizens.
 *
 * This class provides business logic and delegates persistence operations
 * to the CitizensRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CitizenService {
  constructor(
    private readonly repository: CitizenRepository,
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

  async getBasicInfoFromCitizen(phoneNumber: string) {
    console.log('getBasicInfoFromCitizen', phoneNumber);
    try {
      const result = await this.repository.findAll({
        include: [
          {
            model: CitizenContact,
            as: 'citizenContacts',
            required: true,
            where: { contactType: 'PHONE', value: phoneNumber },
          },
        ],
      });

      return result.flatMap((r) => {
        const { citizenContacts, ...citizen } = r.toJSON();
        return citizenContacts.map(
          (c: CitizenContact) =>
            ({
              vtipDoc: c.tipDoc,
              vdocIde: c.docIde,
              vnumTel: c.value,
              vcontacto: citizen.name,
            }) as ContactoDto,
        );
      });
    } catch (error) {
      throw error;
    }
  }

  async createCitizenContactMultiple(
    citizenContactList: CitizenContactDto[],
  ): Promise<CitizenContact[]> {
    // Eliminamos duplicados dentro del propio array (opcional pero recomendado)
    const uniqueContacts = citizenContactList.filter(
      (contact, index, self) =>
        index ===
        self.findIndex(
          (c) =>
            c.tipDoc === contact.tipDoc &&
            c.docIde === contact.docIde &&
            c.contactType === contact.contactType &&
            c.value === contact.value,
        ),
    );
    // Buscamos en BD cuáles ya existen
    const existingContacts = await this.citizenContactRepository.findAll({
      where: {
        [Op.or]: uniqueContacts.map((c) => ({
          tipDoc: c.tipDoc,
          docIde: c.docIde,
          contactType: c.contactType,
          value: c.value,
        })),
      },
    });

    console.log('existingContacts', existingContacts);

    // Armamos un set para búsqueda rápida
    const existingSet = new Set(
      existingContacts
        .map((c) => c.toJSON())
        .map((c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`),
    );

    // Filtramos los que NO existen
    const contactsToCreate = uniqueContacts.filter(
      (c) =>
        !existingSet.has(`${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`),
    );

    // Insertamos solo los que faltan
    if (contactsToCreate.length > 0) {
      return this.citizenContactRepository.bulkCreate(contactsToCreate);
    } else {
      return [];
    }
  }

  getCitizenContactsByTipDocAndDocIde(
    tipDoc: string,
    docIde: string,
  ): Promise<CitizenContact[]> {
    return this.citizenContactRepository.findAll({
      where: { tipDoc, docIde },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Deletes (soft delete) a contact citizen by its ID.
   * @param id Citizen identifier
   * @returns void
   */
  removeContact(id: number): Promise<void> {
    try {
      return this.citizenContactRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
