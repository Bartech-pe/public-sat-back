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
import { HolidayService } from '../service/holiday.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

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

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateHolidayDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
