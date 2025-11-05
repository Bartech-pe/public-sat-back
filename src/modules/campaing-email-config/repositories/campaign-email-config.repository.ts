import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CampaignEmailConfig } from '../entities/campaing-email-config.entity';

@Injectable()
export class CampaignEmailConfigRepository extends GenericCrudRepository<CampaignEmailConfig > {
  constructor(
    @InjectModel(CampaignEmailConfig)
    model: typeof CampaignEmailConfig,
  ) {
      super(model);
  }
}