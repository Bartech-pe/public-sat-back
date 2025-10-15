import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { centralDBConfig } from 'config/env';

@Injectable()
export class CentralDatabaseService implements OnModuleInit, OnModuleDestroy {
  private sequelize: Sequelize | null = null;
  private readonly logger = new Logger(CentralDatabaseService.name);
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
      this.sequelize = sequelize;
      if (!this.connected) {
        this.connected = true;
        this.logger.log('Conectado a la DB Central');
      }
    } catch (error) {
      if (this.connected) {
        this.logger.warn('Conexión con DB Central perdida');
      } else {
        this.logger.warn('DB Central no disponible, intentando reconectar...');
      }
      this.connected = false;
      this.sequelize = null;
    }
  }

  private startReconnectWatcher() {
    const intervalMs = 15000; // intenta cada 15 segundos
    this.reconnectInterval = setInterval(async () => {
      if (!this.connected) {
        await this.connect();
      } else {
        // Verificar si sigue viva la conexión
        try {
          await this.sequelize?.authenticate();
        } catch {
          this.logger.warn(
            '💥 Conexión con DB Central falló, marcando como desconectada.',
          );
          this.connected = false;
          this.sequelize = null;
        }
      }
    }, intervalMs);
  }

  getConnection(): Sequelize | null {
    return this.sequelize;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
