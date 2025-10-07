import { MultiChannelChatService } from '@modules/multi-channel-chat/multi-channel-chat.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { channelConnectorConfig } from 'config/env';
import { io, Socket } from 'socket.io-client';

export class EmailListenService implements OnModuleInit {
  private readonly logger = new Logger(MultiChannelChatService.name);
  private socket: Socket;
  constructor(@InjectQueue('mail-events') private readonly mailQueue: Queue) {}

  onModuleInit() {
    this.socket = io(channelConnectorConfig.baseUrl, {
      transports: ['websocket'], // fuerza WebSocket puro
    });

    this.socket.on('connect', () => {
      this.logger.log(
        `Conectado a Socket.IO EMAIL en ${channelConnectorConfig.baseUrl}`,
      );
    });

    this.socket.on('disconnect', () => {
      this.logger.log('Cliente NestJS desconectado');
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
