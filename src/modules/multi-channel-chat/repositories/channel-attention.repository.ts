import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelAttention } from '../entities/channel-attention.entity';
import { CountOptions } from 'sequelize';

@Injectable()
export class ChannelAttentionRepository extends GenericCrudRepository<ChannelAttention> {
  constructor(
    @InjectModel(ChannelAttention)
    model: typeof ChannelAttention,
  ) {
    super(model);
  }

  async count(options?: Omit<CountOptions<{}>, 'group'>) {
    return await this.model.count(options);
  }
}
