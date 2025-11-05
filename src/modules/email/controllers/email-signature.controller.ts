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
import { EmailSignatureService } from '../services/email-signature.service';
import { CreateEmailSignatureDto } from '../dto/create-email-signature.dto';
import { UpdateEmailSignatureDto } from '../dto/update-email-signature.dto';
import { EmailSignature } from '../entities/email-signature.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

/**
 * Controller for managing EmailSignatures.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for emailsignatures.
 */
@ApiBearerAuth()
@Controller('email-signatures')
export class EmailSignatureController {
  constructor(private readonly service: EmailSignatureService) {}

  /**
   * Retrieves a paginated list of emailsignatures.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing emailsignatures
   */
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EmailSignature>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  /**
   * Retrieves a single emailsignature by its ID.
   * @param id EmailSignature identifier
   * @returns EmailSignature entity
   */
  @Get('byTokenUserId')
  findOneByUserId(
    @CurrentUser() user: User,
  ): Promise<EmailSignature | null> {
    return this.service.findByUserId(+user.id);
  }

  /**
   * Retrieves a single emailsignature by its ID.
   * @param id EmailSignature identifier
   * @returns EmailSignature entity
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<EmailSignature> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new email-signature.
   * @param dto Data Transfer Object containing emailsignature data
   * @returns The created EmailSignature entity
   */
  @Post()
  create(@Body() dto: CreateEmailSignatureDto): Promise<EmailSignature> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing emailsignature by its ID.
   * @param id EmailSignature identifier
   * @param dto Data to update
   * @returns Updated EmailSignature entity
   */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEmailSignatureDto,
  ): Promise<EmailSignature> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a email-signature.
   * @param id EmailSignature identifier
   * @returns EmailSignature entity with updated status
   */
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<EmailSignature> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a emailsignature by its ID.
   * @param id EmailSignature identifier
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
