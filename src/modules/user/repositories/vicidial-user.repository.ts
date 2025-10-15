import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { User } from '../entities/user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { CallHistory } from '@modules/call/entities/call-history.entity';

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

  getAllAloSatState(): Promise<VicidialUser[]> {
    return this.model.findAll<VicidialUser>({
      include: [
        {
          model: User,
          as: 'user',
          include: [
            {
              model: CallHistory,
              as: 'callHistory',
              separate: true, // hace una consulta separada
              limit: 1, // solo trae 1 registro
              order: [['createdAt', 'DESC']], // el último por fecha
            },
          ],
        },
        ChannelState,
      ],
    });
  }
}
