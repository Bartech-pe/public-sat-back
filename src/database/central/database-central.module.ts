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
      synchronize: false,
      logging: false,
      retryAttempts: 5,
      dialectOptions: {
        connectTimeout: 60000, // 60 segundos
        dateStrings: true, // Evita conversión automática a UTC
      },
      retryDelay: 3000,
      pool: {
        max: 20, // más conexiones disponibles
        min: 5,
        acquire: 30000, // esperar hasta 30s por una conexión
        idle: 10000, // cerrar conexiones ociosas después de 10s
      },
    }),
  ],
})
export class DatabaseCentralModule {}
