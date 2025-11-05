import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  SMSFilterDto,
  SMSFilterResponseDto,
  SMSSendDto,
  SMSSendResponseDto,
} from './dto/SMSSendDto';
import { ApiResponseProxyDTO } from '../ApiResponseProxyDTO';

@Injectable()
export class SMSProxy {
  constructor(private readonly configService: ConfigService) {}
  async SMSMasive(body: SMSSendDto) {
    const client = axios.create({
      baseURL: this.configService.get<string>('SMS_MAS_URL') ?? '',
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
    const response: AxiosResponse<SMSSendResponseDto> = await client.post(
      '/ServicioSMS/ServicioSMS.svc/EnviarSMS',
      body,
      { validateStatus: () => true },
    );
    const promise = new ApiResponseProxyDTO<SMSSendResponseDto>();
    if (response.status != 200) {
      promise.success = false;
      promise.statusCode = response.status;
      promise.url = response.config.url || '';
      return promise;
    }
    const content = response.data;
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = content;
    return promise;
  }
  async SMSSolo(body: SMSFilterDto) {
    const client = axios.create({
      baseURL: this.configService.get<string>('SMS_INV_URL') ?? '',
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
    const response: AxiosResponse<SMSFilterResponseDto> = await client.post(
      '/WS_Enviar_Alerta/WS_Enviar_Alerta.svc/EnviarSMS',
      body,
      { validateStatus: () => true },
    );
    const promise = new ApiResponseProxyDTO<SMSFilterResponseDto>();
    if (response.status != 200) {
      promise.success = false;
      promise.statusCode = response.status;
      promise.url = response.config.url || '';
      return promise;
    }
    const content = response.data;
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = content;
    return promise;
  }
}
