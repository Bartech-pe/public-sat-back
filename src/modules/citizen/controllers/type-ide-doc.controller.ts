import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TypeIdeDocService } from '../services/type-ide-doc.service';
import { TypeIdeDoc } from '../entities/type-ide-doc.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing TypeIdeDocs.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for typeidedocs.
 */
@ApiBearerAuth()
@Controller('type-ide-docs')
export class TypeIdeDocController {
  constructor(private readonly service: TypeIdeDocService) {}

  /**
   * Retrieves a paginated list of typeidedocs.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing typeidedocs
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<TypeIdeDoc>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }
}
