import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from '../service/schedule.service';
import { CreateScheduleDto } from '../dto/schedule/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/schedule/update-schedule.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findById(id);
  }
  @Get('campania/:id')
  findByCampania(@Param('id') id: number) {
    return this.service.findByCampingId(id);
  }
  @Get('week/days')
  getDays() {
    return this.service.getAllDays();
  }
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.service.create(dto);
  }
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    return this.service.update(+id, dto);
  }
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.delete(id);
  }
  @Delete('campain/:id')
  removeByCampain(@Param('id') id: number) {
    return this.service.deleteByCampain(id);
  }
}
