import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { User } from '../entities/user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { CallHistory } from '@modules/call/entities/call-history.entity';
import { Op } from 'sequelize';

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
    const startDay = new Date();
    startDay.setHours(0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59);
    return this.model.findAll<VicidialUser>({
      include: [
        {
          model: User,
          as: 'user',
          include: [
            {
              model: CallHistory,
              as: 'callHistory',
              where: {
                createdAt: {
                  [Op.between]: [startDay, endDay],
                },
              },
              required: false,
              order: [['createdAt', 'DESC']],
            },
          ],
          required: true,
        },
        { model: ChannelState, required: true },
      ],
    });
  }
}
