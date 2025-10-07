import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { User } from '../entities/user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@Injectable()
export class VicidialUserRepository extends GenericCrudRepository<VicidialUser> {
  constructor(
    @InjectModel(VicidialUser)
    model: typeof VicidialUser,
  ) {
    super(model);
  }

  getAloSatState(user: User): Promise<VicidialUser | null> {
    return this.model.findOne<VicidialUser>({
      where: { userId: user.id },
      include: [ChannelState],
    });
  }
}
