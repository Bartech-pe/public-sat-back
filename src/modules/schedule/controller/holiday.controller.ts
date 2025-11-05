import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HolidayService } from '../service/holiday.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Holiday } from '../entities/holiday.entity';

@ApiBearerAuth()
@Controller('holidays')
export class HolidayController {
  constructor(private readonly service: HolidayService) {}

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post('byDate')
  findByDate(@Body() dto: { date: Date }) {
    return this.service.findbyDate(dto.date);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateHolidayDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateHolidayDto): Promise<Holiday> {
      return this.service.update(+id, dto);
  }

  
  @Put('toggleStatus/:id')
    toggleStatus(@Param('id') id: number): Promise<Holiday> {
      return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
