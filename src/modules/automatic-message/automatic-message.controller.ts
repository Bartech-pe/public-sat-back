import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { AutomaticMessageService } from './automatic-message.service';
import { CreateAutomaticMessageDto } from './dto/create-automatic-message.dto';
import { UpdateAutomaticMessageDto } from './dto/update-automatic-message.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { AutomaticMessage } from './entities/automatic-message.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Automatic Message.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Automatic Message.
 */

@ApiBearerAuth()
@Controller('automatic-messages')
export class AutomaticMessageController {
  constructor(private readonly service: AutomaticMessageService) {}

  /**
   * Retrieves a paginated list of automatic messages.
   * @param user Current authenticated user
   * @param query Pagination query parameters (limit, offset, filters)
   * @returns PaginatedResponse containing campaign types
   */
  @ApiBearerAuth()
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<AutomaticMessage>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  @ApiBearerAuth()
  @Get('descriptions-by-channel/:channel')
  getallAutomaticWelcomeMessagesFromChannel(@Param('categoryId') categoryId: number)
  {
    return this.service.getallAutomaticWelcomeMessagesFromChannel(categoryId)
  }


  /**
   * Retrieves a single automatic message by its ID.
   * @param id AutomaticMessage identifier
   * @returns AutomaticMessage entity
   */
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<AutomaticMessage> {
    return this.service.findOne(+id);
  }

  /**
   * Creates a new automatic message.
   * @param dto Data Transfer Object containing campaign type data
   * @returns The created AutomaticMessage entity
   */
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateAutomaticMessageDto): Promise<AutomaticMessage> {
    return this.service.create(dto);
  }

  /**
   * Updates an existing automatic message.
   * @param id AutomaticMessage identifier
   * @param dto Data to update
   * @returns Updated AutomaticMessage entity
   */
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAutomaticMessageDto,
  ): Promise<AutomaticMessage> {
    return this.service.update(+id, dto);
  }

  /**
   * Toggles the status (active/inactive) of a automatic message.
   * @param id AutomaticMessage identifier
   * @returns AutomaticMessage entity with updated status
   */
  @ApiBearerAuth()
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<AutomaticMessage> {
    return this.service.toggleStatus(id);
  }

  /**
   * Deletes (soft delete) a automatic message by its ID.
   * @param id AutomaticMessage identifier
   * @returns void
   */
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
