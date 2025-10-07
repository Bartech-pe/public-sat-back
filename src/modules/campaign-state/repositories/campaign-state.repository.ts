import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CampaignState } from '../entities/campaign-state.entity';

/**
 * Repository for CampaignState entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to CampaignState in the future.
 */
@Injectable()
export class CampaignStateRepository extends GenericCrudRepository<CampaignState> {
  constructor(
    @InjectModel(CampaignState)
    model: typeof CampaignState,
  ) {
    super(model);
  }
}
