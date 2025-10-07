import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SmsCampaingDetail } from '../entities/sms-campaing-detail.entity.ts.js';

@Injectable()
export class SmsCampaingDetailRepository extends GenericCrudRepository<SmsCampaingDetail> {
  constructor(
    @InjectModel(SmsCampaingDetail)
    model: typeof SmsCampaingDetail,
  ) {
    super(model);
  }
}
