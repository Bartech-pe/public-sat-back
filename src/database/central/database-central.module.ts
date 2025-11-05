import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { centralDBConfig } from 'config/env';

@Module({
  imports: [
    SequelizeModule.forRoot({
      name: 'central',
      dialect: centralDBConfig.dialect,
      timezone: '-05:00',
      host: centralDBConfig.host,
      port: centralDBConfig.port,
      username: centralDBConfig.user,
      password: centralDBConfig.pass,
      database: centralDBConfig.name,
      autoLoadModels: true,
      // sync: { alter: false },
      synchronize: false,
      logging: false,
      retryAttempts: 5,
      retryDelay: 3000,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        connectTimeout: 60000, // 60 segundos
        dateStrings: true, // Evita conversión automática a UTC
      },
    }),
  ],
})
export class DatabaseCentralModule {}
