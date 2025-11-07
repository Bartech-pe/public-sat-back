import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SmsCampaign } from '../entities/sms-campaign.entity';

@Injectable()
export class SmsCampaignRepository extends GenericCrudRepository<SmsCampaign> {
  constructor(
    @InjectModel(SmsCampaign)
    model: typeof SmsCampaign,
  ) {
    super(model);
  }
}
