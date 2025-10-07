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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelSchedule } from './entities/channel-schedule.entity';
import { CreateChannelScheduleDto } from './dto/create-channel-schedule.dto';
import { UpdateChannelScheduleDto } from './dto/update-channel-schedule.dto';
import { ChannelScheduleService } from './channel-schedule.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { User } from '@modules/user/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@ApiTags('Channel schedule')
@ApiBearerAuth()
@Controller('channel-schedule')
export class ChannelScheduleController {
  constructor(private readonly service: ChannelScheduleService) {}

  @Post()
  create(@Body() dto: CreateChannelScheduleDto): Promise<ChannelSchedule> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChannelSchedule>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateChannelScheduleDto,
  ): Promise<ChannelSchedule> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<ChannelSchedule> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
