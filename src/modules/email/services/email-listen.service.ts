import { InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { channelConnectorConfig } from 'config/env';
import { io, Socket } from 'socket.io-client';
import { EmailCredentialService } from './email-credential.service';

export class EmailListenService implements OnModuleInit {
  private readonly logger = new Logger(EmailListenService.name);
  private socket: Socket;
  constructor(
    @InjectQueue('mail-events') private readonly mailQueue: Queue,
    private readonly emailCredentialService: EmailCredentialService,
  ) {}

  onModuleInit() {
    this.socket = io(channelConnectorConfig.baseUrl, {
      auth: {
        token: channelConnectorConfig.verifyToken,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ['websocket'],
    });

    this.socket.on('connect', async () => {
      await this.emailCredentialService.initEmail();
      this.logger.log(
        `Conectado a Socket.IO EMAIL en ${channelConnectorConfig.baseUrl}`,
      );
    });

    this.socket.on('disconnect', () => {
      this.logger.log('Cliente NestJS desconectado a Socket.IO EMAIL');
    });

    this.socket.on('reconnect', (attempt) => {
      this.logger.log(`Reconectado a Socket.IO EMAIL ${attempt}`);
    });

    this.socket.on('reconnect_error', (error) => {
      this.logger.error('Error al reconectar a Socket.IO EMAIL:', error);
    });

    this.socket.on('error', (error) => {
      this.logger.error('Error Socket.IO EMAIL:', error);
    });

    this.socket.on('connect_error', (err) => {
      this.logger.error('Error de conexión a Socket.IO EMAIL:', err.message);
    });

    // Escuchar evento del Gateway
    this.socket.on('email.sent', async (data) => {
      await this.mailQueue.add('process-email', data, {
        removeOnComplete: true,
        attempts: 3,
      });
    });
  }
}
