import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelState } from '../entities/channel-state.entity';
import { emailAvailableStateId } from '@common/constants/channel.constant';

@Injectable()
export class ChannelStateRepository extends GenericCrudRepository<ChannelState> {
  constructor(
    @InjectModel(ChannelState)
    model: typeof ChannelState,
  ) {
    super(model);
  }

  async findAvalibleEmail() {
    return await this.model.findOne<ChannelState>({
      where: { id: emailAvailableStateId },
    });
  }
}
