import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';
import { join } from 'path';
import {
  audiobaseConfig,
  channelConnectorConfig,
  envConfig,
  metabaseConfig,
} from 'config/env';
import * as helmet from 'helmet';

// Winston Logger
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
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  const FRONTEND_ORIGINS = [envConfig.crmUrl];
  const META_BASE = metabaseConfig.url;
  const API_AUDIOS = audiobaseConfig.url;
  const CHANNEL_CONECTOR = channelConnectorConfig.baseUrl;

  const ORIGINS = [...FRONTEND_ORIGINS, API_AUDIOS];

  app.enableCors({
    origin: ORIGINS,
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "'unsafe-hashes'",
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
          ],
          'script-src-attr': ["'self'", "'unsafe-inline'"],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'blob:',
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
            'https://accounts.google.com',
          ],
          'img-src': ["'self'", 'data:', 'blob:', 'cid:', 'https:'],
          'font-src': [
            "'self'",
            'data:',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
          ],
          'connect-src': [
            "'self'",
            'ws:',
            'wss:',
            'https://api.iconify.design',
            'https://api.simplesvg.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
            'https://api.unisvg.com',
            ...FRONTEND_ORIGINS,
            CHANNEL_CONECTOR,
            API_AUDIOS,
            META_BASE,
          ],
          'frame-src': ["'self'", META_BASE],
          'object-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'upgrade-insecure-requests': [],
          'media-src': [
            "'self'",
            'blob:',
            'data:',
            'https://satvcwebcc01.sat.gob.pe',
            'https://cc-demo.xyzconn.xyz',
            'https://satsttcc01.sat.gob.pe',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SAT CRM - API')
    .setDescription('API para el manejo de SAT CRM')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  // Prefijo global
  app.setGlobalPrefix('v1');

  // Parsers
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Archivos estáticos y uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useStaticAssets(join(process.cwd(), 'public'));

  // Endpoint opcional para reportes CSP
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.post('/csp-report', (req, res) => {
    try {
      winstonLogger.warn('CSP report received', { report: req.body });
    } catch (e) {
      winstonLogger.error('Error processing CSP report', { error: e });
    }
    res.status(204).send();
  });

  // Fallback SPA (Angular)
  app.use((req, res, next) => {
    if (
      !req.originalUrl.startsWith('/v1') &&
      !req.originalUrl.startsWith('/swagger') &&
      !req.originalUrl.startsWith('/uploads')
    ) {
      try {
        res.sendFile(join(process.cwd(), 'public', 'index.html'));
      } catch {
        return null;
      }
    } else {
      next();
    }
  });

  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de validaciones
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Inicia servidor
  await app.listen(envConfig.port, '0.0.0.0');
  winstonLogger.log({
    level: 'info',
    message: `Application running on http://localhost:${envConfig.port}`,
  });
}

bootstrap();
