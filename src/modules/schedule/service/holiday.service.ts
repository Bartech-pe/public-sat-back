import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HolidayRepository } from '../repositories/holiday.repository';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private readonly repository: HolidayRepository) {}
  async findOne(id: number) {
    return await this.repository.findById(id);
  }
  async findAll() {
    return this.repository.findAll();
  }
  async findbyDate(date: Date) {
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    console.log("startTime", startTime)
    return await this.repository.findOne({ where: { startTime } });
  }
  async create(dto: CreateHolidayDto) {
    const startTime = dto.startTime;
    startTime.setHours(0, 0, 0, 0);
    let endTime = new Date(startTime);
    endTime.setHours(23, 59, 59, 999);

    const exist = await this.repository.findOne({
      where: { startTime },
    });
    if (exist) {
      throw new NotFoundException('fecha ya existente');
    }
    try {
      return await this.repository.create({
        ...dto,
        endTime,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async update(id: number, body: UpdateHolidayDto) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundException('feriado no existe');
    }
    try {
      return await this.repository.update(id, body);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async delete(id: number) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundException('feriado no existe');
    }
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
