import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

import { User } from '@modules/user/entities/user.entity';
import { TypeIdeDocRepository } from '../repositories/type-ide-doc.repository';
import { TypeIdeDoc } from '../entities/type-ide-doc.entity';

/**
 * Service layer for managing TypeIdeDocs.
 *
 * This class provides business logic and delegates persistence operations
 * to the TypeIdeDocsRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class TypeIdeDocService {
  constructor(private readonly repository: TypeIdeDocRepository) {}

  /**
   * Retrieves a paginated list of typeidedocs.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing typeidedocs
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<TypeIdeDoc>> {
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
