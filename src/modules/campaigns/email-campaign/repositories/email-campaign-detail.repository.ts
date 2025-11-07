import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EmailCampaignDetail } from '../entities/email-campaign-detail.entity';

@Injectable()
export class EmailCampaignDetailRepository extends GenericCrudRepository<EmailCampaignDetail> {
  constructor(
    @InjectModel(EmailCampaignDetail)
    model: typeof EmailCampaignDetail,
  ) {
    super(model);
  }
}
