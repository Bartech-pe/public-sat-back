import { Injectable } from '@nestjs/common';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { AudioStoreDetails } from '../entities/audio-store-details.entity';

@Injectable()
export class AudioStoreDetailsRepository {
  constructor(private readonly dbCentralService: DatabaseCentralService) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  getModel() {
    return this.db!.model(AudioStoreDetails) as ModelCtor<AudioStoreDetails>;
  }
}
