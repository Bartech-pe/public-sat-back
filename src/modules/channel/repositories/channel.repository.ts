import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class ChannelRepository extends GenericCrudRepository<Channel> {
  constructor(
    @InjectModel(Channel)
    model: typeof Channel,
  ) {
    super(model);
  }
}
