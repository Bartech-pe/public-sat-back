import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { centralDBConfig } from 'config/env';

import { VicidialUser } from '@modules/vicidial/central-telefonica/entities/vicidial-user.entity';
import { VicidialCampaign } from '@modules/vicidial/central-telefonica/entities/vicidial-campaign.entity';
import { AudioStoreDetails } from '@modules/vicidial/central-telefonica/entities/audio-store-details.entity';
import { VicidialLead } from '@modules/vicidial/central-telefonica/entities/vicidial-lead.entity';
import { VicidialLists } from '@modules/vicidial/central-telefonica/entities/vicidial-lists.entity';
import { VicidialCallTimes } from '@modules/vicidial/central-telefonica/entities/vicidial-call-times.entity';
import { VicidialCallTimesHolidays } from '@modules/vicidial/central-telefonica/entities/vicidial-call-times-holidays.entity';

export const CENTRAL_DB = 'CENTRALDB';

@Injectable()
export class DatabaseCentralService implements OnModuleInit, OnModuleDestroy {
  private sequelize: Sequelize | null = null;
  private readonly logger = new Logger(DatabaseCentralService.name);
  private reconnectInterval: NodeJS.Timeout | null = null;
  private connected = false;

  async onModuleInit() {
    await this.connect();
    this.startReconnectWatcher();
  }

  async onModuleDestroy() {
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    if (this.sequelize) await this.sequelize.close();
  }

  private async connect(): Promise<void> {
    try {
      const sequelize = new Sequelize({
        dialect: centralDBConfig.dialect as any,
        host: centralDBConfig.host,
        port: centralDBConfig.port,
        username: centralDBConfig.user,
        password: centralDBConfig.pass,
        database: centralDBConfig.name,
        logging: false,
      });

      await sequelize.authenticate();
      sequelize.addModels([
        VicidialUser,
        VicidialCampaign,
        AudioStoreDetails,
        VicidialLists,
        VicidialLead,
        VicidialCallTimes,
        VicidialCallTimesHolidays,
      ]);
      this.sequelize = sequelize;
      this.connected = true;
      this.logger.log('Conectado a la DB Central');
    } catch {
      this.connected = false;
      this.sequelize = null;
      this.logger.warn('DB Central no disponible, reintentando...');
    }
  }

  private startReconnectWatcher() {
    const intervalMs = 15000;
    this.reconnectInterval = setInterval(async () => {
      if (!this.connected) await this.connect();
    }, intervalMs);
  }

  getConnection(): Sequelize | null {
    return this.sequelize;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
