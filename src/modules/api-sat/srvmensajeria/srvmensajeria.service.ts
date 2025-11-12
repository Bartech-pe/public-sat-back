import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SrvSmsMessage, SmsMessageResponse } from './dto/sms-message.dto';
import { apiSatConfig } from 'config/env';
import { RequestEmail } from './dto/email-request.dto';
import { SrvSmsMessageOne } from './dto/sms-message-one.dto';

@Injectable()
export class SrvmensajeriaService {
  private readonly logger = new Logger(SrvmensajeriaService.name);
  private client: AxiosInstance = axios.create({
    baseURL: apiSatConfig.mensajeria,
    timeout: 10000,
    headers: {
      Accept: 'application/json',
    },
  });

  async sendSmsMessageOne(body: SrvSmsMessageOne) {
    const response: AxiosResponse<SrvSmsMessageOne> = await this.client.post(
      `sms/unitario`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el exchangeCode de ${response.status}`,
      );
    }
    return response.data;
  }

  async sendSmsMessage(body: SrvSmsMessage) {
    const response: AxiosResponse<SmsMessageResponse> = await this.client.post(
      `sms/lote`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el exchangeCode de ${response.status}`,
      );
    }
    return response.data;
  }

  async sendMailMessage(body: any) {
    try {
      const response = await this.client.post('/correo', body);

      if (response.status === 200) {
        this.logger.log(`Correo enviado exitosamente a: ${body.correoDestino}`);
        return true;
      }

      return false;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al enviar el correo electrónico',
      );
    }
  }
}
