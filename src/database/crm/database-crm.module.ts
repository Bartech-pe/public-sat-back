import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeHooksProvider } from './sequelize-hooks.provider';
import { dbConfig, envConfig } from 'config/env';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.user,
      password: dbConfig.pass,
      database: dbConfig.name,
      autoLoadModels: true,
      sync: { alter: false },
      synchronize: envConfig.isDev,
      logging: envConfig.isDev,
      retryAttempts: 5,
      dialectOptions: {
        connectTimeout: 20000, // 20 segundos
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
  providers: [SequelizeHooksProvider],
})
export class DatabaseCrmModule {}
