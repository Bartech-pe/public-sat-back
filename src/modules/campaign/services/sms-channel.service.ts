import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SmsMessageChannel, SmsMessageResponse } from '../dto/sms-message.dto';
import { satConfig } from 'config/env';

@Injectable()
export class SmsChannelService {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: satConfig.smsUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async sendMessages(body: SmsMessageChannel) {
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
}
