import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { AudioCampaign } from '../entities/audio-campaign.entity';

/**
 * Repository for Campaign entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Campaign in the future.
 */
@Injectable()
export class AudioCampaignRepository extends GenericCrudRepository<AudioCampaign> {
  constructor(
    @InjectModel(AudioCampaign)
    model: typeof AudioCampaign,
  ) {
    super(model);
  }
}
