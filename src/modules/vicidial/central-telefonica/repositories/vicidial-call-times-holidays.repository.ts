import { Injectable } from '@nestjs/common';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialCallTimesHolidays } from '../entities/vicidial-call-times-holidays.entity';

@Injectable()
export class VicidialCallTimesHolidaysRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(
      VicidialCallTimesHolidays,
    ) as ModelCtor<VicidialCallTimesHolidays>;
  }
}
