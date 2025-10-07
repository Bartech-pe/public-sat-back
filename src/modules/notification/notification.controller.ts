import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Notification } from './entities/notification.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Notification>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get('unread')
  async findUnread(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Notification>> {
    // This would be implemented in the service if needed
    // For now, we'll just return all notifications
    return this.service.findAll(user, query.limit!, query.offset!);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Notification> {
    return this.service.findOne(+id);
  }

//   @Post()
//   create(
//     @CurrentUser() user: User,
//     @Body() dto: CreateNotificationDto,
//   ): Promise<Notification> {
//     // Set the current user as the creator
//     return this.service.create({
//       ...dto,
//       createdBy: user.id,
//     });
//   }

  @Patch('mark-as-read/:id')
  markAsRead(@Param('id') id: number): Promise<Notification> {
    return this.service.markAsRead(+id);
  }

//   @Post('mark-all-as-read')
//   markAllAsRead(@CurrentUser() user: User): Promise<void> {
//     return this.service.markAllAsRead(user.id);
//   }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(+id);
  }
}
