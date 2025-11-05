import { Inject, Injectable } from '@nestjs/common';
import {
  CENTRAL_DB,
  DatabaseCentralService,
} from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialLead } from '../entities/vicidial-lead.entity';

@Injectable()
export class VicidialLeadRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(VicidialLead) as ModelCtor<VicidialLead>;
  }
}
