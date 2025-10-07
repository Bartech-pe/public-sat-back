import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelAssistance } from '../entities/channel-assistance.entity';

/**
 * Repository for ChannelAssistance entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to ChannelAssistance in the future.
 */
@Injectable()
export class ChannelAssistanceRepository extends GenericCrudRepository<ChannelAssistance> {
  constructor(
    @InjectModel(ChannelAssistance)
    model: typeof ChannelAssistance,
  ) {
    super(model);
  }
}
