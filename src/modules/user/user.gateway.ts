import { Role } from '@modules/role/entities/role.entity';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
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
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async handleConnection(client: any) {
    try {
      const token = client.handshake?.headers?.authorization?.split(' ')[1];
      if (token) {
        const payload = this.jwtService.verify(token);
        const user = await this.userRepository.findById(payload.sub, {
          include: [{ model: Role }],
        });
        client.user = user;
      }
    } catch (err) {
      console.error('Error autenticando socket:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    client.removeAllListeners();
  }

  afterInit(server: any) {
    console.log('serverListo');
  }

  notifyPhoneStateUser(userId?: number) {
    this.server.emit(`user.phone.state.request`, {
      userId,
    });
  }
}
