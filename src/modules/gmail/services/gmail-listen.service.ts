import { InjectQueue } from "@nestjs/bullmq";
import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import { io, Socket } from 'socket.io-client';

export class GmailListenService implements OnModuleInit{
    private socket: Socket;
    constructor( @InjectQueue('mail-events') private readonly mailQueue: Queue,
    private configService:ConfigService){}

    onModuleInit() {
       this.socket = io(this.configService.get<string>('BASE_URL_CHANNEL_CONNECTOR'), {
         transports: ['websocket'], // fuerza WebSocket puro
       });

      this.socket.on('connect', () => {
        console.log('✅ Cliente NestJS conectado al Gateway:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Cliente NestJS desconectado');
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
