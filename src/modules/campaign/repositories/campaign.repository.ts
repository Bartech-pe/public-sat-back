import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Campaign } from '../entities/campaign.entity';

/**
 * Repository for Campaign entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Campaign in the future.
 */
@Injectable()
export class CampaignRepository extends GenericCrudRepository<Campaign> {
  constructor(
    @InjectModel(Campaign)
    model: typeof Campaign,
  ) {
    super(model);
  }
}
