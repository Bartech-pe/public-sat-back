import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ActualCall, CallAMi, ChannelData } from './dto/ami.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AMIGateway
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
  handleNewMessage(newMessage: CallAMi[]) {
    this.server.emit('CoreShowChannelsComplete', newMessage);
  }
}
