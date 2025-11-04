import { Inject, Injectable } from '@nestjs/common';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialCallTimesHolidays } from '../entities/vicidial-call-times-holidays.entity';

@Injectable()
export class VicidialCallTimesHolidaysRepository {
  private model: ModelCtor<VicidialCallTimesHolidays> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(
        VicidialCallTimesHolidays,
      ) as ModelCtor<VicidialCallTimesHolidays>;
    }
  }

  getModel() {
    return this.model;
  }
}
