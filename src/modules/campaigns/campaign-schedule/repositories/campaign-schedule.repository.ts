import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CampaignSchedule } from '../entities/campaign-schedule.entity';

@Injectable()
export class CampaignScheduleRepository extends GenericCrudRepository<CampaignSchedule> {
  constructor(
    @InjectModel(CampaignSchedule)
    model: typeof CampaignSchedule,
  ) {
    super(model);
  }
}
