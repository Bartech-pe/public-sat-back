import { Inject, Injectable } from '@nestjs/common';
import { CENTRAL_DB } from '@database/central/database-central.service';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { AudioStoreDetails } from '../entities/audio-store-details.entity';

@Injectable()
export class AudioStoreDetailsRepository {
  private model: ModelCtor<AudioStoreDetails> | null = null;
  constructor(@Inject(CENTRAL_DB) private readonly db: Sequelize | null) {
    if (this.db) {
      this.model = this.db.model(
        AudioStoreDetails,
      ) as ModelCtor<AudioStoreDetails>;
    }
  }

  getModel() {
    return this.model;
  }
}
