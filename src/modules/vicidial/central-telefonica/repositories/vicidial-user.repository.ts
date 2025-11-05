import { Injectable } from '@nestjs/common';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';

@Injectable()
export class VicidialUserRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(VicidialUser) as ModelCtor<VicidialUser>;
  }
}
