import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PortfolioQueueProcessor } from './portfolio-queue.processor';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PortfolioGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => PortfolioQueueProcessor))
    private readonly processor: PortfolioQueueProcessor,
  ) {}

  handleConnection(client: any) {
    console.log(`📡 Cliente conectado: ${client.id}`);
  }

  sendProgress(
    updated: boolean,
    portfolioId: number,
    name: string,
    processed: number,
    total: number,
    remainingSeconds?: number,
  ) {
    this.server.emit('portfolio-progress', {
      updated,
      portfolioId,
      name,
      processed,
      total,
      remainingSeconds,
    });
  }

  async sendCancelled(portfolioId: number, name: string, updated: boolean) {
    if (!updated) {
      await this.processor.deletePortfolio(portfolioId);
    }
    this.server.emit('portfolio-cancelled', {
      portfolioId,
      name,
      message: `Carga cancelada para cartera ${name}`,
    });
  }

  sendComplete(portfolioId: number, name: string) {
    this.server.emit('portfolio-complete', {
      portfolioId,
      name,
      message: 'Cartera cargada con éxito',
    });
  }

  sendError(portfolioId: number, name: string, message: string) {
    this.server.emit('portfolio-error', {
      portfolioId,
      name,
      message,
    });
  }

  /**
   * Permite al cliente (frontend) cancelar una carga en curso
   */
  @SubscribeMessage('cancel-portfolio')
  async handleCancelRequest(
    @MessageBody() data: { portfolioId: number },
  ): Promise<void> {
    const { portfolioId } = data;
    console.log(
      `Solicitud de cancelación recibida para cartera ${portfolioId}`,
    );

    this.processor.cancelProcess(portfolioId);
  }
}
