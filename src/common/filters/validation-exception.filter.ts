import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = (exceptionResponse as any)?.message;

    // Extrae los mensajes de error
    const originalMessages: string[] =
      typeof message === 'string'
        ? [message]
        : (exceptionResponse as any)?.message || [];

    // Mapea y personaliza todos los mensajes
    const messages = originalMessages.map((msg: string) => {
      if (typeof msg === 'string' && msg.includes('should not exist')) {
        const match = msg.match(/property (.*?) should not exist/);
        const property = match ? match[1] : 'desconocida';
        return `La propiedad '${property}' no está permitida.`;
      }
      return msg;
    });

    response.status(status).json({
      statusCode: status,
      message: messages,
      error: 'Bad Request',
    });
  }
}
