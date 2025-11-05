import { Injectable } from '@nestjs/common';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialCallTimes } from '../entities/vicidial-call-times.entity';

@Injectable()
export class VicidialCallTimesRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(VicidialCallTimes) as ModelCtor<VicidialCallTimes>;
  }
}
