import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SmsCampaignDetail } from '../entities/sms-campaign-detail.entity';

@Injectable()
export class SmsCampaignDetailRepository extends GenericCrudRepository<SmsCampaignDetail> {
  constructor(
    @InjectModel(SmsCampaignDetail)
    model: typeof SmsCampaignDetail,
  ) {
    super(model);
  }
}
