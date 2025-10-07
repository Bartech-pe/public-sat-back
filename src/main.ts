import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';
// import { initSocket } from '@common/lib/socket-server';
import { join } from 'path';
import { envConfig } from 'config/env';

const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    //  { logger: winstonLogger }
  );

  const config = new DocumentBuilder()
    .setTitle('SAT CRM - API')
    .setDescription('API para el manejo de SAT CRM')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  app.setGlobalPrefix('v1');

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'public'));

  app.use((req, res, next) => {
    if (
      !req.originalUrl.startsWith('/v1') &&
      !req.originalUrl.startsWith('/swagger')
    ) {
      try {
        res.sendFile(join(process.cwd(), 'public', 'index.html'));
      } catch (e) {
        return null;
      }
    } else {
      next();
    }
  });

  // Aquí sirves archivos desde /uploads con la ruta pública /uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Esto hace que se accedan desde http://localhost:3000/uploads
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new ValidationExceptionFilter());

  // Habilitar el manejo de JSON y formularios en NestJS
  app.use(json({ limit: '50mb' })); // Ajusta el límite según necesites
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(envConfig.port, '0.0.0.0');

  // const httpServer = app.getHttpServer();
  // initSocket(httpServer);

  winstonLogger.log({
    level: 'info',
    message: `Application started on http://localhost:${envConfig.port}`,
  });
}
bootstrap();
