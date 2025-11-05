import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Channel } from '../entities/channel.entity';

/**
 * Repository for Channel entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Channel in the future.
 */
@Injectable()
export class ChannelRepository extends GenericCrudRepository<Channel> {
  constructor(
    @InjectModel(Channel)
    model: typeof Channel,
  ) {
    super(model);
  }
}
