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
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import { CreateScheduleAssignmentDto } from './dto/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dto/update-schedule-assignment.dto';
import { ScheduleAssignmentService } from './schedule-assignment.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { User } from '@modules/user/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@ApiTags('Schedule Assignment')
@ApiBearerAuth()
@Controller('schedule-assignment')
export class ScheduleAssignmentController {

  constructor(private readonly service: ScheduleAssignmentService) { }

  @Post()
  create(@Body() dto: CreateScheduleAssignmentDto): Promise<ScheduleAssignment> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ScheduleAssignment>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateScheduleAssignmentDto): Promise<ScheduleAssignment> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<ScheduleAssignment> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
