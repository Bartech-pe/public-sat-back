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
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        connectTimeout: 60000, // aumenta tiempo para conectar
      },
      retry: {
        max: 3, // intenta reintentar en caso de desconexión
      },
      define: { timestamps: false },
      logging: false,
    }),
  ],
})
export class DatabaseCentralModule {}
