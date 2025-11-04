import { Inject, Injectable } from '@nestjs/common';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialCallTimes } from '../entities/vicidial-call-times.entity';

@Injectable()
export class VicidialCallTimesRepository {
  private model: ModelCtor<VicidialCallTimes> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(
        VicidialCallTimes,
      ) as ModelCtor<VicidialCallTimes>;
    }
  }

  getModel() {
    return this.model;
  }
}
