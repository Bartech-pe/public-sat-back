import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import Redis from 'ioredis';
import { RasaService } from '@modules/call/rasa.service';
import { IncomingMessage } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import { MultiChannelChatService } from '../multi-channel-chat.service';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { OutgoingPayload } from '@common/interfaces/channel-connector/outgoing/outgoing.interface';
import { ChannelCitizen } from '../entities/channel-citizen.entity';
import { ChannelRoom } from '../entities/channel-room.entity';
import {
  ChannelAttentionStatus,
  ChannelAttention,
} from '../entities/channel-attention.entity';
import { ChannelAttentionRepository } from '../repositories/channel-attention.repository';
import { ChannelAttentionService } from './channel-attention.service';
import {
  AdvisorAssigned,
  ChannelRoomNewMessageDto,
} from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { MultiChannelChatGateway } from '../multi-channel-chat.gateway';
import { Channels } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { InboxCredential } from '@modules/inbox/entities/inbox-credential.entity';
import { ChannelMessageRepository } from '../repositories/channel-messages.repository';

export interface BufferedMessage {
  data: IncomingMessage;
  assistance: ChannelAttention;
  citizen: ChannelCitizen;
  externalMessageId: string;
  user?: AdvisorAssigned | null;
  channelRoom: ChannelRoom;
  credentials: InboxCredential;
}

@Injectable()
export class MessageBufferService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageBufferService.name);
  private readonly bufferKey = 'incoming_messages_buffer';
  private readonly waitTime = 5000;
  private readonly timeoutDuration = 600; 
  private timeoutId: NodeJS.Timeout;
  private subscriber: Redis;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly rasaService: RasaService,
    @Inject(forwardRef(() => MultiChannelChatService))
    private readonly multiChannelChatService: MultiChannelChatService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private readonly multiChannelChatGateway: MultiChannelChatGateway,
    private readonly assistanceRepository: ChannelAttentionRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    @Inject(forwardRef(() => ChannelAttentionService))
    private readonly assistanceService: ChannelAttentionService,
  ) {
    this.subscriber = new Redis();
  }

  async onModuleInit() {

    await this.redisClient.config('SET', 'notify-keyspace-events', 'Ex');

    await this.subscriber.subscribe('__keyevent@0__:expired', (err) => {
      if (err) {
        this.logger.error(
          'Error al suscribirse a eventos de Redis para timeout',
          err,
        );
      }
    });

    this.subscriber.on('message', (channel, key) => {
      if (
        channel === '__keyevent@0__:expired' &&
        key.startsWith('message_buffer_timeout:')
      ) {
        const senderId = key.replace('message_buffer_timeout:', '');
        this.onMessageBufferTimeout(senderId);
      }
    });
  }

  async onModuleDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    await this.subscriber.quit();
  }

  async addMessageToBuffer(message: BufferedMessage) {
    try {
      const senderId = (message?.citizen?.phoneNumber ?? '').toString();
      const botMustAnswer =
        [ChannelType.WHATSAPP, ChannelType.CHATSAT].includes(
          message.data.payload.channel,
        ) && message.channelRoom.botReplies;

      if (botMustAnswer) {
        await this.redisClient.rpush(this.bufferKey, JSON.stringify(message));
        await this.redisClient.set(
          `buffered_message:${senderId}`,
          JSON.stringify(message),
          'EX',
          650,
        );
      }

      await this.setMessageBufferTimeout(senderId);

      this.resetTimer(botMustAnswer);
    } catch (error) {
      this.logger.error('Error agregando mensaje al buffer', error);
    }
  }

  private async setMessageBufferTimeout(senderId: string) {
    if (!senderId) return;
    await this.redisClient.set(
      `message_buffer_timeout:${senderId}`,
      '1',
      'EX',
      this.timeoutDuration,
    );
  }

  private async onMessageBufferTimeout(senderId: string) {
    try {
      console.log('onMessageBufferTimeout init');
      const bufferedMessageStr = await this.redisClient.get(
        `buffered_message:${senderId}`,
      );
      if (!bufferedMessageStr) {
        await this.cleanupMessageBufferProcess(senderId);
        return;
      }

      const bufferedMessage: BufferedMessage = JSON.parse(bufferedMessageStr);

      const assistance = await this.assistanceRepository.findById(
        bufferedMessage.assistance.id,
      );
      if (assistance.status !== ChannelAttentionStatus.CLOSED) {
        const outMessage: OutgoingPayload = {
          channel: bufferedMessage.data.payload.channel as Channels,
          botReply: true,
          citizenId: bufferedMessage.citizen.id,
          userId: bufferedMessage?.user?.id,
          assistanceId: bufferedMessage.assistance.id,
          channelRoomId: bufferedMessage.channelRoom.id,
          attachments: [],
          phoneNumber: bufferedMessage.credentials.phoneNumber!,
          message:
            'Por tu seguridad estamos cerrando la conversación🔐.\nPuedes volver a escribirnos cuando desees, estamos para servirte 👋😄',
          options: {
            type: 'text',
            text: 'Por tu seguridad estamos cerrando la conversación🔐.\nPuedes volver a escribirnos cuando desees, estamos para servirte 👋😄',
          },
          timestamp: new Date(),
          lastMessageId: bufferedMessage.externalMessageId,
          to: bufferedMessage.citizen.phoneNumber!,
          chat_id: bufferedMessage.channelRoom.externalChannelRoomId,
          credentials: {
            accessToken: bufferedMessage.credentials.accessToken,
            phoneNumberId: bufferedMessage.credentials.phoneNumberId,
          },
        };

        await this.multiChannelChatService.sendMessageToExternal(outMessage);
        await this.multiChannelChatService.delay(500);
        await this.createChannelMessageFromBuffered(
          bufferedMessage,
          'Por tu seguridad estamos cerrando la conversación🔐.\nPuedes volver a escribirnos cuando desees, estamos para servirte 👋😄',
        );

        await this.assistanceService.closeChannelAttention({
          assistanceId: bufferedMessage.assistance.id,
          channelRoomId: bufferedMessage.channelRoom.id,
        });
      }

      await this.cleanupMessageBufferProcess(senderId);
      this.logger.log(
        `Conversación cerrada por timeout para usuario: ${senderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error procesando timeout para usuario ${senderId}:`,
        error,
      );
      await this.cleanupMessageBufferProcess(senderId);
    }
  }

  private async cleanupMessageBufferProcess(senderId: string) {
    try {
      const keysToDelete = [
        `message_buffer_timeout:${senderId}`,
        `buffered_message:${senderId}`, 
      ];
      await this.redisClient.del(...keysToDelete);
      await this.removeUserMessagesFromBuffer(senderId);
    } catch (error) {
      this.logger.error(
        `Error en cleanup Message Buffer para ${senderId}:`,
        error,
      );
    }
  }

  private async removeUserMessagesFromBuffer(senderId: string) {
    try {
      const bufferKey = 'incoming_messages_buffer';
      await this.redisClient.watch(bufferKey);
      const messages = await this.redisClient.lrange(bufferKey, 0, -1);
      if (messages.length === 0) {
        await this.redisClient.unwatch();
        return;
      }

      const filteredMessages = messages.filter((messageStr) => {
        try {
          const message = JSON.parse(messageStr);
          const msgPhoneNumber = (
            message?.citizen?.phoneNumber ?? ''
          ).toString();
          return msgPhoneNumber !== senderId;
        } catch {
          return true;
        }
      });

      const multi = this.redisClient.multi();
      multi.del(bufferKey);
      if (filteredMessages.length > 0) {
        multi.rpush(bufferKey, ...filteredMessages);
      }
      await multi.exec();

      const removedCount = messages.length - filteredMessages.length;
    } catch (error) {
      this.logger.error(
        `Error en cleanup de buffer compartido para ${senderId}:`,
        error,
      );
      await this.redisClient.unwatch();
    }
  }

  private resetTimer(processMessage: boolean) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      if (processMessage) {
        this.processBufferedMessages();
      }
    }, this.waitTime);
  }

  private async processBufferedMessages() {
    try {
      const length = await this.redisClient.llen(this.bufferKey);
      if (length === 0) return;

      const messages = await this.redisClient.lrange(this.bufferKey, 0, -1);
      await this.redisClient.del(this.bufferKey);
      const bufferedMessages: BufferedMessage[] = messages.map((m) =>
        JSON.parse(m),
      );
      this.logger.log(
        `Procesando batch de ${bufferedMessages.length} mensajes`,
      );

      const grouped = bufferedMessages.reduce(
        (acc, msg) => {
          const sender = (msg?.citizen?.phoneNumber ?? '').toString();
          if (!acc[sender]) acc[sender] = [];
          acc[sender].push(msg);
          return acc;
        },
        {} as Record<string, BufferedMessage[]>,
      );

      const timeoutKeys = Object.keys(grouped).map(
        (senderId) => `message_buffer_timeout:${senderId}`,
      );
      if (timeoutKeys.length > 0) {
        try {
          const pipeline = this.redisClient.pipeline();
          timeoutKeys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        } catch (error) {
          this.logger.warn(
            'Error limpiando timeouts en batch, continuando:',
            error,
          );
        }
      }
      for (const senderId in grouped) {
        const combinedMessage = grouped[senderId]
          .map((m) => m.data.payload.message.body)
          .join(' ');
        const exampleMsg = grouped[senderId][0];

        const rasaPayload = {
          channel: exampleMsg.data.payload.channel,
          senderId: senderId,
          message: combinedMessage,
        };

        try {
          const responses =
            await this.rasaService.sendMessageToRasa(rasaPayload);
          for (const response of responses) {
            const outMessage: OutgoingPayload = {
              channel: exampleMsg.data.payload.channel as Channels,
              botReply: true,
              citizenId: exampleMsg.channelRoom.channelCitizenId,
              userId: exampleMsg.channelRoom?.userId,
              assistanceId: exampleMsg.assistance.id,
              channelRoomId: exampleMsg.channelRoom.id,
              phoneNumber: exampleMsg.credentials.phoneNumber ?? '',
              message: response.text ?? '',
              options: {
                type: 'text',
                text: response.text?.replaceAll('**', '*') ?? '',
              },
              attachments: [],
              timestamp: new Date(),
              lastMessageId: exampleMsg.externalMessageId,
              to: exampleMsg.citizen.phoneNumber ?? '',
              chat_id: exampleMsg.channelRoom.externalChannelRoomId,
              credentials: {
                accessToken: exampleMsg.credentials.accessToken,
                phoneNumberId: exampleMsg.credentials.phoneNumberId,
              },
            };
            await this.multiChannelChatService.sendMessageToExternal(
              outMessage,
            );

            // RESTAURADO: Usar método específico con gateway
            await this.createChannelMessageFromBuffered(
              exampleMsg,
              response.text?.replaceAll('**', '*') ?? '',
            );
          }

          // RESTAURADO: Renovar timeout después de procesar
          await this.redisClient.set(
            `buffered_message:${senderId}`,
            JSON.stringify(exampleMsg),
            'EX',
            650,
          );
          await this.setMessageBufferTimeout(senderId);
        } catch (err) {
          this.logger.error(
            `Error enviando mensaje a Rasa para sender ${senderId}`,
            err,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error procesando buffer de mensajes', error);
    }
  }

  private async createChannelMessageFromBuffered(
    message: BufferedMessage,
    content: string,
  ) {
    await this.multiChannelChatService.delay(1000);
    const newMessageSaved =
      await this.multiChannelChatService.createChannelMessage({
        assistanceId: message.assistance.id,
        channelRoomId:
          message.channelRoom.dataValues?.id || message.channelRoom.id, // CORREGIDO: Manejo robusto del ID
        content,
        senderType: 'bot',
        status: 'unread',
        timestamp: new Date(),
        userId:
          message.channelRoom.dataValues?.userId ||
          (message?.channelRoom?.userId as number),
        externalChannelRoomId: message.data.payload.chat_id as number,
        externalMessageId: message.data.payload.message.id as string,
      });

    let countUnreadMessages =
      await this.channelMessageRepository.findAndCountAll({
        where: {
          channelRoomId: message.channelRoom.id,
          status: 'unread',
          senderType: 'citizen',
        },
      });
      let channelRoom = await this.multiChannelChatService.getChannelRoomCurrentStatus(message.channelRoom.id)
      let attention = await this.assistanceService.getAttentionCurrentStatus(message.assistance.id)
      
    let newMessage: ChannelRoomNewMessageDto = {
      channelRoomId: message.channelRoom.id,
      attention:
      {
        id: message.assistance.id,
        status: attention.status
      }, 
      externalRoomId: message.data.payload.chat_id as string,
      channel: message.data.payload.channel,
      advisor: message?.user,
      unreadCount: countUnreadMessages.total,
      status: channelRoom.status,
      message: {
        sender: {
          id: message.citizen.id,
          externalUserId: message.citizen.externalUserId || '',
          fullName: message.citizen.fullName || '',
          phone: message.citizen.phoneNumber,
          avatar: message.citizen.avatarUrl || '',
          alias: message.citizen.name,
          fromCitizen: false,
          isAgent: false,
        },
        id: newMessageSaved.dataValues.id,
        attachments: [],
        externalMessageId: message.data.payload.message.id as string,
        message: content,
        status: 'unread',
        time: new Date(),
        fromMe: true,
      },
      botStatus: 'active',
    };
    this.multiChannelChatGateway.handleNewMessage(newMessage);
  }

  public async hasActiveTimeout(senderId: string): Promise<boolean> {
    const exists = await this.redisClient.exists(
      `message_buffer_timeout:${senderId}`,
    );
    return exists === 1;
  }

  public async clearUserTimeout(senderId: string) {
    await this.redisClient.del(`message_buffer_timeout:${senderId}`);
  }
}
