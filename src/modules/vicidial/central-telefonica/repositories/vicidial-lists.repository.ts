import { Inject, Injectable } from '@nestjs/common';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { VicidialLists } from '../entities/vicidial-lists.entity';

@Injectable()
export class VicidialListsRepository {
  private model: ModelCtor<VicidialLists> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(VicidialLists) as ModelCtor<VicidialLists>;
    }
  }

  getModel() {
    return this.model;
  }
}
