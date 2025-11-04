import { Inject, Injectable } from '@nestjs/common';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialLead } from '../entities/vicidial-lead.entity';

@Injectable()
export class VicidialLeadRepository {
  private model: ModelCtor<VicidialLead> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(VicidialLead) as ModelCtor<VicidialLead>;
    }
  }

  getModel() {
    return this.model;
  }
}
