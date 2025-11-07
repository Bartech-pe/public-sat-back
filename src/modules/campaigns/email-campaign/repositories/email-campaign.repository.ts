import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EmailCampaign } from '../entities/email-campaign.entity';

@Injectable()
export class EmailCampaignRepository extends GenericCrudRepository<EmailCampaign> {
  constructor(
    @InjectModel(EmailCampaign)
    model: typeof EmailCampaign,
  ) {
    super(model);
  }
}
