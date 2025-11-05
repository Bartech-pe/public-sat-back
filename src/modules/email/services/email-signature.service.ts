import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EmailSignatureRepository } from '../repositories/email-signature.repository';
import { EmailSignature } from '../entities/email-signature.entity';
import { CreateEmailSignatureDto } from '../dto/create-email-signature.dto';
import { UpdateEmailSignatureDto } from '../dto/update-email-signature.dto';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing EmailSignatures.
 *
 * This class provides business logic and delegates persistence operations
 * to the EmailSignaturesRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class EmailSignatureService {
  constructor(private readonly repository: EmailSignatureRepository) {}

  /**
   * Retrieves a paginated list of emailsignatures.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing emailsignatures
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<EmailSignature>> {
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
   * Finds a emailsignature by its ID.
   * @param id EmailSignature identifier
   * @returns The emailsignature entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<EmailSignature> {
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
   * Creates a new emailsignature.
   * @param dto Data Transfer Object containing the emailsignature data
   * @returns The created EmailSignature entity
   */
  async create(dto: CreateEmailSignatureDto): Promise<EmailSignature> {
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
   * Creates multiple emailsignatures in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created EmailSignature entities
   */
  async bulkCreate(
    dtoList: CreateEmailSignatureDto[],
  ): Promise<EmailSignature[]> {
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
   * Updates an existing emailsignature by ID.
   * @param id EmailSignature identifier
   * @param dto Data to update
   * @returns The updated EmailSignature entity
   */
  async update(
    id: number,
    dto: UpdateEmailSignatureDto,
  ): Promise<EmailSignature> {
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
   * Toggles the status (active/inactive) of a emailsignature.
   * @param id EmailSignature identifier
   * @returns The updated EmailSignature entity with toggled status
   */
  async toggleStatus(id: number): Promise<EmailSignature> {
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
   * Deletes (soft delete) a emailsignature by its ID.
   * @param id EmailSignature identifier
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
   * Restores a previously deleted emailsignature by its ID.
   * @param id EmailSignature identifier
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
   * Finds a emailsignature by its ID.
   * @param id EmailSignature identifier
   * @returns The emailsignature entity if found
   * @throws NotFoundException if not found
   */
  async findByUserId(userId: number): Promise<EmailSignature | null> {
    try {
      const exist = await this.repository.findOne({
        where: { userId },
      });
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
