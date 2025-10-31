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
  BadRequestException,
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
import { User } from '@modules/user/entities/user.entity';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

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

  @Get(':channel/general-status')
  async getUserStatus(
    @CurrentUser() currentUser: User, 
    @Param('channel') channel: string
  ): Promise<BaseResponseDto<{ userStatus: string, color?: string | null }>> {
    return this.service.getUserStatus(currentUser, channel);
  }

  @Get('available-channels')
  async getInboxAvailablesForUser(@CurrentUser() currentUser: User): Promise<BaseResponseDto<string[]>> {
    return this.service.getInboxAvailablesForUser(currentUser);
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
  
  @Put('inbox-users/change-all-status')
  changeAllUserStatus(
    @CurrentUser() currentUser: User,
    @Body() payload: {
      channel: string,
      isAvailable?: boolean | null,
      channelStateId?: number | null
    }): Promise<BaseResponseDto> {
    console.log('💥 CONTROLADOR payload:', payload);
    console.log('👤 currentUser:', currentUser);
    return this.service.changeAllUserStatus(currentUser, payload);
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
