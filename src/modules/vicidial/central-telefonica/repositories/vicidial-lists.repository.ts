import { Injectable } from '@nestjs/common';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialLists } from '../entities/vicidial-lists.entity';

@Injectable()
export class VicidialListsRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(VicidialLists) as ModelCtor<VicidialLists>;
  }
}
