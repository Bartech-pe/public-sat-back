import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelMessage } from '../entities/channel-message.entity';
import { CountOptions } from 'sequelize';

@Injectable()
export class ChannelMessageRepository extends GenericCrudRepository<ChannelMessage> {
  constructor(
    @InjectModel(ChannelMessage)
    model: typeof ChannelMessage,
  ) {
    super(model);
  }

  async count(options?: Omit<CountOptions<{}>, 'group'>) {
    return await this.model.count(options);
  }
}
