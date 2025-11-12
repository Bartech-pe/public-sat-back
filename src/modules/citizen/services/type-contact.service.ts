import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

import { User } from '@modules/user/entities/user.entity';
import { TypeContactRepository } from '../repositories/type-contact.repository';
import { TypeContact } from '../entities/type-contact.entity';

/**
 * Service layer for managing TypeContacts.
 *
 * This class provides business logic and delegates persistence operations
 * to the TypeContactsRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class TypeContactService {
  constructor(private readonly repository: TypeContactRepository) {}

  /**
   * Retrieves a paginated list of typecontacts.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing typecontacts
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<TypeContact>> {
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
}
