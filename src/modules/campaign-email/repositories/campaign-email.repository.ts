import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CampaignEmail } from '../entities/campaign-email.entity';

@Injectable()
export class CampaignEmailRepository extends GenericCrudRepository<CampaignEmail> {
  constructor(
    @InjectModel(CampaignEmail)
    model: typeof CampaignEmail,
  ) {
      super(model);
  }
}