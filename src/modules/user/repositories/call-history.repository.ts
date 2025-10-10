import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CallHistory } from '../entities/call_history.entity';
import { Op } from 'sequelize';

@Injectable()
export class CallHistoryRepository extends GenericCrudRepository<CallHistory> {
  constructor(
    @InjectModel(CallHistory)
    model: typeof CallHistory,
  ) {
    super(model);
  }

  getLastCall(userId: number): Promise<CallHistory | null> {
    return this.model.findOne<CallHistory>({
      where: { userId: userId },
      order: [['id', 'DESC']],
    });
  }

  async getLastCallOfTheDay(userId: number): Promise<any> {
    const startDay = new Date();
    startDay.setHours(0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59);
    const { rows, count } = await this.model.findAndCountAll<CallHistory>({
      raw: true,
      where: {
        userId: userId,
        [Op.and]: [
          { createdAt: { [Op.gte]: startDay } },
          { createdAt: { [Op.lte]: endDay } },
        ],
      },
      order: [['id', 'DESC']],
    });
    return { ...(rows[0] ?? {}), callsToday: count };
  }

  async setDurationCall(userId: number, seconds?: number) {
    const history = await this.model.findOne<CallHistory>({
      where: { userId },
      order: [['id', 'DESC']],
    });
    if (history) {
      await history.update({
        seconds:
          seconds ??
          (new Date().getTime() -
            new Date(history.toJSON().entryDate).getTime()) /
            1000,
      });
    }
  }
}
