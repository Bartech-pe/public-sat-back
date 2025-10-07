import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChannelSchedule } from '../entities/channel-schedule.entity';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';

@Injectable()
export class ChannelScheduleRepository extends GenericCrudRepository<ChannelSchedule> {
  constructor(
    @InjectModel(ChannelSchedule)
    model: typeof ChannelSchedule,
  ) {
    super(model);
  }
}
