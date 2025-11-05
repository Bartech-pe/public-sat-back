import { Injectable } from '@nestjs/common';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';

@Injectable()
export class VicidialCampaingRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(VicidialCampaign) as ModelCtor<VicidialCampaign>;
  }
}
