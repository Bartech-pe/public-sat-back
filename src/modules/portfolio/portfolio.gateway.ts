import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PortfolioGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`📡 Cliente conectado: ${client.id}`);
  }

  sendProgress(portfolioId: number, processed: number, total: number) {
    const percentage = ((processed / total) * 100).toFixed(2);
    this.server.emit('portfolioProgress', {
      portfolioId,
      processed,
      total,
      percentage,
    });
  }

  sendComplete(portfolioId: number) {
    this.server.emit('portfolioComplete', {
      portfolioId,
      message: '🎉 Proceso completado con éxito',
    });
  }
}
