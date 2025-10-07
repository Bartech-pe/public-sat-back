import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ConversationTracker } from './dto/Conversation';
import { ApiResponseProxyDTO } from '../ApiResponseProxyDTO';
import { RasaMessage, RasaResponse } from './dto/Rasa';
import { satConfig } from 'config/env';

@Injectable()
export class RasaProxy {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: satConfig.rasaUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
  }
  // conversations
  async getConsersationsHistory(senderId: string) {
    const response: AxiosResponse<ConversationTracker> = await this.client.get(
      `/conversations/${senderId}/tracker`,
    );
    const promise = new ApiResponseProxyDTO<ConversationTracker>();
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el historial con un estado de ${response.status}`,
      );
    }
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = response.data;
    return promise;
  }
  async sendMessageToRasa(
    senderId: string,
    message: string,
    channel: string,
    metadata?: Record<string, any>,
  ) {
    const payload: RasaMessage = {
      sender: senderId,
      message: message,
      metadata: {
        channel: channel,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
    const response: AxiosResponse<RasaResponse[]> = await this.client.post(
      `/webhooks/rest/webhook`,
      payload,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el webhook con un estado de ${response.status}`,
      );
    }
    const promise: RasaResponse[] = response.data;
    return promise;
  }
  async resetConversation(senderId: string) {
    const response: AxiosResponse<void> = await this.client.put(
      `/conversations/${senderId}/tracker/events`,
      [
        {
          event: 'restart',
        },
      ],
    );
    const promise = new ApiResponseProxyDTO<any>();
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el reset con un estado de ${response.status}`,
      );
    }
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = response.data;
    return promise;
  }
  async pauseConversation(senderId: string) {
    const response: AxiosResponse<void> = await this.client.put(
      `/conversations/${senderId}/tracker/events`,
      [{ event: 'pause' }],
    );
    const promise = new ApiResponseProxyDTO<any>();
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para la pausa con un estado de ${response.status}`,
      );
    }
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = response.data;
    return promise;
  }
  async resumeConversation(senderId: string) {
    const response: AxiosResponse<void> = await this.client.put(
      `/conversations/${senderId}/tracker/events`,
      [{ event: 'resume' }],
    );
    const promise = new ApiResponseProxyDTO<any>();
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para la pausa con un estado de ${response.status}`,
      );
    }
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = response.data;
    return promise;
  }
}
