import {
  ConversationStatus,
  ConversationTracker,
  CreateConversationDto,
} from '@common/proxy/rasa/dto/Conversation';
import {
  RasaBase,
  RasaLine,
  RasaResponse,
  SendMessageHookDto,
  SendMessageRasaDto,
} from '@common/proxy/rasa/dto/Rasa';
import { RasaProxy } from '@common/proxy/rasa/rasa.proxy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import e from 'express';
interface RasaMessageResponse {
  text: string;
  recipient_id: number;
}
@Injectable()
export class RasaService {
  private readonly conversationStops = new Map<string, boolean>();
  constructor(private readonly rasaProxy: RasaProxy) {}
  isConversationPaused(senderId: string): boolean {
    return this.conversationStops.get(senderId) || false;
  }
  async getConversation(senderId: string) {
    const historyproxy = await this.rasaProxy.getConsersationsHistory(senderId);
    const history = historyproxy.element;
    if (!history) {
      throw new InternalServerErrorException(
        `No se encontro el elemnto de la conversacion`,
      );
    }
    const userMessages = history.events.filter((item) => item.event === 'user');
    console.log('history', userMessages);
    const response: ConversationStatus = {
      messageCount: userMessages.length,
      isPaused: this.isConversationPaused(senderId),
      lastActivity: history.events[history.events.length - 1]?.timestamp
        ? new Date(
            history.events[history.events.length - 1].timestamp * 1000,
          ).toISOString()
        : 'N/A',
      currentIntent: history.latest_message?.intent?.name,
    };
    return response;
  }
  async resetConversation(senderId: string) {
    await this.rasaProxy.resetConversation(senderId);
    this.conversationStops.delete(senderId);
  }
  async pauseConversation(senderId: string) {
    this.conversationStops.set(senderId, true);
    await this.rasaProxy.pauseConversation(senderId);
  }
  async sendMessageToRasa(body: SendMessageRasaDto): Promise<RasaLine[]>{
    if (this.conversationStops.get(body.senderId)) {
      return [];
      // Solo va a dejar de enviar consultas REST a Rasa, Pero dejaremos esto por si alguna vez lo necesitamos.
      // const paused: RasaLine[] = [
      //   {
      //     recipient_id: body.senderId,
      //     text: 'paused',
      //   },
      // ];
      // return paused;
    };
    return await this.rasaProxy.sendMessageToRasa(
      body.senderId,
      body.message,
      body.channel,
      body.metadata,
    );
  }
  async createConversation(body: CreateConversationDto) {
    const senderId = body.senderId;
    this.conversationStops.delete(senderId);
    await this.resetConversation(senderId);
    const response = await this.rasaProxy.sendMessageToRasa(
      senderId,
      body.intial,
      body.channel,
      {
        conversation_start: true,
      },
    );
    return response;
  }
  async resumeConversation(senderId: string) {
    this.conversationStops.set(senderId, false);
    await this.rasaProxy.resumeConversation(senderId);
  }
  formatResponseForChannel(
    responses: RasaResponse[],
    channel: 'whatsapp' | 'telegram',
  ) {
    return responses.map((response) => {
      const baseResponse: RasaBase = {
        recipient_id: response.recipient_id,
        text: response.text,
      };
      if (channel === 'whatsapp') {
        return {
          ...baseResponse,
          buttons: response.buttons?.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.payload,
              title: btn.title,
            },
          })),
        };
      } else if (channel === 'telegram') {
        return {
          ...baseResponse,
          reply_markup: response.buttons
            ? {
                inline_keyboard: [
                  response.buttons.map((btn) => ({
                    text: btn.title,
                    callback_data: btn.payload,
                  })),
                ],
              }
            : undefined,
        };
      }
      return baseResponse;
    });
  }
  async continueConversation(body: SendMessageRasaDto) {
    const history = await this.rasaProxy.getConsersationsHistory(body.senderId);
    if (
      !history.success ||
      history.element == null ||
      history.element.events.length === 0
    ) {
      const create: CreateConversationDto = {
        senderId: body.senderId,
        intial: body.message,
        channel: body.channel,
      };
      return await this.createConversation(create);
    }
    return await this.sendMessageToRasa(body);
  }
  async getConversationHistory(senderId: string): Promise<ConversationTracker> {
    const historyproxy = await this.rasaProxy.getConsersationsHistory(senderId);
    const history = historyproxy.element;
    if (!history) {
      throw new InternalServerErrorException(
        `No se encontro el elemnto de la conversacion`,
      );
    }
    return history;
  }
  async telegramWebHook(body: SendMessageHookDto) {
    const responses = await this.rasaProxy.sendMessageToRasa(
      body.senderId,
      body.message,
      'telegram',
      body.metadata,
    );
    const response = this.formatResponseForChannel(responses, 'telegram');
    return response;
  }
  async whastappWebHook(body: SendMessageHookDto) {
    const responses = await this.rasaProxy.sendMessageToRasa(
      body.senderId,
      body.message,
      'whatsapp',
      body.metadata,
    );
    const response = this.formatResponseForChannel(responses, 'whatsapp');
    return response;
  }
}
