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
import { NotificationService } from '@modules/notification/notification.service';
import { CreateNotificationDto } from '@modules/notification/dto/create-notification.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200'], // mejor explícito
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly notificationService: NotificationService) {}

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
  async handleAlertas(@MessageBody() request: { idUser: number; message: string }): Promise<void> {
    try {
      console.log("Recibida nueva notificación:", request);
      
      // Crear y guardar la notificación
      const createNotificationDto: CreateNotificationDto = {
        userId: request.idUser,
        message: request.message
      };
      
      // Guardar la notificación en la base de datos
      const notification = await this.notificationService.create(createNotificationDto);
      console.log('Notificación guardada:', notification);
      
      // Emitir la notificación al usuario específico
      const socketId = this.clients.get(request.idUser);
      if (socketId) {
        this.server.to(socketId).emit('receive_alertas', {
          ...notification,
          isNew: true
        });
      }
      
      // También emitir a todos los clientes si es necesario
      this.server.emit('receive_alertas', notification);
      
    } catch (error) {
      console.error('Error al procesar la notificación:', error);
      // Puedes manejar el error de la manera que prefieras
      // Por ejemplo, emitiendo un mensaje de error al cliente
      this.server.emit('notification_error', {
        error: 'Error al procesar la notificación',
        details: error.message
      });
    }
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
        console.warn(`⚠️ Usuario ${userId} no está conectado`);
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
  }

  handleConnection(client: Socket) {
    console.log('🔌 Cliente conectado Socket:', client.id);
  }

}
