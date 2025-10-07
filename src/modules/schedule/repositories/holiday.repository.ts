import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Holiday } from '../entities/holiday.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HolidayRepository extends GenericCrudRepository<Holiday> {
  constructor(
    @InjectModel(Holiday)
    model: typeof Holiday,
  ) {
    super(model);
  }
}
