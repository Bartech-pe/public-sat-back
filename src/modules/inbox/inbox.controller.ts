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
import { InboxService } from './inbox.service';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Inbox } from './entities/inbox.entity';
import { CreateInboxUserDto } from './dto/create-inbox-user.dto';
import { InboxUser } from './entities/inbox-user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { QueryDto } from '@common/dto/query.dto';
import { InvalidateInboxCredentialDto } from './dto/invalidate-inbox-credentials.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Inbox.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Inbox.
 */
@ApiBearerAuth()
@Controller('inboxs')
export class InboxController {
  constructor(private readonly service: InboxService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Inbox>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Inbox> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateInboxDto): Promise<Inbox> {
    return this.service.create(dto);
  }

  @Post('assignment/:id')
  assignment(
    @Param('id') id: number,
    @Body() dto: CreateInboxUserDto[],
    @Query() query: QueryDto,
  ): Promise<InboxUser[]> {
    const byUser = query?.q?.byUser;
    if (byUser) {
      return this.service.assignmentByUser(id, dto);
    } else {
      return this.service.assignment(id, dto);
    }
  }

  @Get('assignment/:userId')
  findByAssignmentId(@Param('userId') userId: number): Promise<InboxUser[]> {
    return this.service.findByAssignmentId(+userId);
  }


  @Post('assignment/supervisor/:userId')
  assignmentSupervisor(
    @Param('userId') userId: number,
    @Body() dto: CreateInboxUserDto[],
  ): Promise<InboxUser[]> {
    return this.service.assignmentSupervisor(userId, dto);
  }

  
  
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateInboxDto): Promise<Inbox> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Inbox> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Post('credentials/invalidate')
  invalidateCredentials(@Body() payload: InvalidateInboxCredentialDto) {
    return this.service.invalidateCredentials(payload);
  }
}
