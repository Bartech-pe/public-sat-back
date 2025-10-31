import { Body, Controller, Post } from "@nestjs/common";
import { apiSatConfig, channelConnectorConfig } from "config/env";
import axios, { AxiosInstance } from "axios";

interface TelegramAuthResponse {
  success: string;
  message: string;
  authStatuses?: {
    authMethod: 'EMAIL' | 'DEFAULT';
    emailRequired: boolean;
    codeSended: boolean;
  };
}

interface TelegramAuthRequest {
  email?: string;
  phoneNumber: string;
  code?: string;
  force?: boolean;
}

@Controller('telegram')
export class TelegramController {

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: channelConnectorConfig.baseUrl,
      timeout: 50000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  @Post('init')
  async sendMessage(@Body() payload: TelegramAuthRequest): Promise<TelegramAuthResponse> {
    try {
      const response = await this.client.post<TelegramAuthResponse>('/telegram/init', {
        ...payload,
        force: true, 
      });

      return response.data;

    } catch (error: any) {
      console.error('❌ Error al enviar mensaje a la API externa:', error.message);

      return {
        success: 'false',
        message: error.response?.data?.message || 'Error al conectar con el servicio externo',
      };
    }
  }

  @Post('confirm-code')
  async confirmAuth(@Body() payload: TelegramAuthRequest): Promise<TelegramAuthResponse> {
    try {
      const response = await this.client.post<TelegramAuthResponse>('/telegram/confirm-code', payload);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al confirmar código:', error.message);
      return {
        success: 'false',
        message: error.response?.data?.message || 'Error al confirmar código',
      };
    }
  }
}
