import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
