import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer()
  server: Server;

  private clients: Map<number, string> = new Map(); // userId → socketId

  // 1. Guardamos el socket.id cuando el frontend se conecta y se registra
  @SubscribeMessage('register_user')
  handleRegisterUser(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket
  ) {
    this.clients.set(userId, client.id);
    console.log(`🟢 Usuario ${userId} registrado con socketId ${client.id}`);
  }

  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() message: any): void {
    this.server.emit('receive_message', message);
  }


  
  @SubscribeMessage('send_alertas')
  handleAlertas(@MessageBody() alerta: any): void {
    console.log(alerta);
    this.server.emit('receive_alertas', alerta);
  }

  // 2. Enviar mensaje a usuarios
  @SubscribeMessage('mensaje_chat')
  handleSendMessageToUsers(
    @MessageBody() data: { to: number[]; title: string; message: string }
  ) {
    for (const userId of data.to) {
      const socketId = this.clients.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('nueva_alerta', {
          title: data.title,
          message: data.message,
        });
        console.log(`📤 Alerta enviada a ${userId}`);
      } else {
        console.warn(`Usuario ${userId} no está conectado`);
      }
    }
  }

  // @SubscribeMessage('send_message')
  // handleSendMessage(
  //   @MessageBody()
  //   data: { chatRoomId: number; message: any; to: number[] },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   for (const userId of data.to) {
  //     const socketId = this.clients.get(userId);
  //     if (socketId) {
  //       this.server.to(socketId).emit('receive_message', data.message);
  //     }
  //   }
  // }

  // 3. Desconexión
  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.clients.entries()) {
      if (socketId === client.id) {
        this.clients.delete(userId);
        console.log(`🔴 Usuario ${userId} desconectado`);
        break;
      }
    }
    client.removeAllListeners();
  }

  handleConnection(client: Socket) {
    console.log('🔌 Cliente conectado Socket:', client.id);
  }

}
