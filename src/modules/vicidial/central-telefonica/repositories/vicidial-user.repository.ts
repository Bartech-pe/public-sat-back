import { Inject, Injectable } from '@nestjs/common';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';

@Injectable()
export class VicidialUserRepository {
  private model: ModelCtor<VicidialUser> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(VicidialUser) as ModelCtor<VicidialUser>;
    }
  }

  getModel() {
    return this.model;
  }
}
