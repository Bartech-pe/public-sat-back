import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AloSatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleDisconnect(client: any) {
    client.removeAllListeners();
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('serverListo');
  }

  afterInit(server: any) {
    console.log('serverListo');
  }

  notifyChangeState(userId: number) {
    this.server.emit('changeVicidialState', { userId });
  }
}
