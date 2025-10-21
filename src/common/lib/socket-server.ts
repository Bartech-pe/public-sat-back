import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: Server | null = null;

export const initSocket = (server: HTTPServer) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);

      socket.on('send_message', (message) => {
        console.log('Mensaje recibido:', message);
        // reenviar a todos menos al emisor
        socket.broadcast.emit('receive_message', message);
      });
    });

    io.on('disconnect', (socket) => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  }
  return io;
};
