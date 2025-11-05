import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CampaignType } from '../entities/campaign-type.entity';

/**
 * Repository for CampaignType entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to CampaignType in the future.
 */
@Injectable()
export class CampaignTypeRepository extends GenericCrudRepository<CampaignType> {
  constructor(
    @InjectModel(CampaignType)
    model: typeof CampaignType,
  ) {
    super(model);
  }

  async getSMS() {
    return await this.findOne({ where: { id: 1 } });
  }
}
