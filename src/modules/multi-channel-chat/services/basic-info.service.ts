import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import Redis from 'ioredis';
import { MultiChannelChatService } from '../multi-channel-chat.service';
import { ChannelCitizenRepository } from '../repositories/channel-citizen.repository';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { OutgoingPayload } from '@common/interfaces/channel-connector/outgoing/outgoing.interface';
import {
  BufferedMessage,
  MessageBufferService,
} from './message-buffer.service';
import {
  Channels,
  CitizenDocType,
} from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ChannelCitizen } from '../entities/channel-citizen.entity';
import { ChannelAttentionStatus } from '../entities/channel-attention.entity';
import { ChannelAttentionRepository } from '../repositories/channel-attention.repository';
import { ChannelAttentionService } from './channel-attention.service';
import { ChannelRoomNewMessageDto } from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { MultiChannelChatGateway } from '../multi-channel-chat.gateway';
import { ChannelMessageRepository } from '../repositories/channel-messages.repository';

@Injectable()
export class BasicInfoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BasicInfoService.name);
  private subscriber: Redis;
  public bufferTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly bufferWaitTime = 3000;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(forwardRef(() => MultiChannelChatService))
    private readonly multiChannelChatService: MultiChannelChatService,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly assistanceRepository: ChannelAttentionRepository,
    @Inject(forwardRef(() => ChannelAttentionService))
    private readonly assistanceService: ChannelAttentionService,
    @Inject(forwardRef(() => MultiChannelChatGateway))
    private readonly multiChannelChatGateway: MultiChannelChatGateway,
    private readonly citizenRepository: ChannelCitizenRepository,
    private readonly messageBufferService: MessageBufferService,
  ) {
    this.subscriber = new Redis();

    this.redis.config('SET', 'notify-keyspace-events', 'Ex').then(() => {
      this.subscriber.subscribe('__keyevent@0__:expired', (err) => {
        if (err) {
          this.logger.error('Error al suscribirse a eventos de Redis', err);
        }
      });

      this.subscriber.on('message', (channel, key) => {
        if (
          channel === '__keyevent@0__:expired' &&
          key.startsWith('basic_info_timeout:')
        ) {
          const phone = key.replace('basic_info_timeout:', '');
          this.onBasicInfoTimeout(phone);
        }
      });
    });
  }

  async onModuleInit() {
    this.logger.log('BasicInfoService inicializado');
  }

  async onModuleDestroy() {
    this.bufferTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.bufferTimeouts.clear();
    await this.subscriber.quit();
    this.logger.log('BasicInfoService destruido');
  }

  // =====================
  // Helpers reutilizables
  // =====================

  /** Construye el OutgoingPayload base con los campos comunes */
  private buildBaseOutgoing(
    message: BufferedMessage,
  ): Omit<OutgoingPayload, 'options'> {
    return {
      channel: message.data.payload.channel as Channels,
      botReply: true,
      userId: message.user.id,
      citizenId: message.citizen.id,
      assistanceId: message.assistance.id,
      channelRoomId: message.channelRoom.id,
      phoneNumber: message.credentials.phoneNumber!,
      attachments: [],
      message: message.data.payload.message.body ?? '',
      timestamp: new Date(),
      lastMessageId: message.externalMessageId,
      to: message.citizen.phoneNumber!,
      chat_id: message.channelRoom.externalChannelRoomId,
      credentials: {
        accessToken: message.credentials.accessToken,
        phoneNumberId: message.credentials.phoneNumberId,
      },
    };
  }

  /** Envía un mensaje al canal y lo persiste en DB como channel message */
  private async sendAndPersist(
    message: BufferedMessage,
    options: OutgoingPayload['options'],
    persistedContent?: string,
  ) {
    const outMessage: OutgoingPayload = {
      ...this.buildBaseOutgoing(message),
      options,
    };

    await this.multiChannelChatService.sendMessageToExternal(outMessage);
    await this.multiChannelChatService.delay(500);

    // Si no nos pasan un texto alterno para persistir, usamos el "text" (si existiera)
    const content =
      persistedContent ??
      (options && 'text' in options ? ((options as any).text ?? '') : '');

    await this.createChannelMessageFromBuffered(message, content);
  }

  /** Crea el channel message a partir del BufferedMessage y contenido */
  private async createChannelMessageFromBuffered(
    message: BufferedMessage,
    content: string,
  ) {
    const newMessageSaved =
      await this.multiChannelChatService.createChannelMessage({
        assistanceId: message.assistance.id,
        channelRoomId:
          message.channelRoom.dataValues?.id || message.channelRoom.id,
        content,
        senderType: 'bot',
        status: 'unread',
        timestamp: new Date(),
        userId:
          message.channelRoom.dataValues?.userId ||
          (message.channelRoom.userId as number),
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
    let newMessage: ChannelRoomNewMessageDto = {
      channelRoomId: message.channelRoom.id,
      unreadCount: countUnreadMessages.total,
      assistanceId: message.assistance.id,
      externalRoomId: message.data.payload.chat_id as string,
      channel: message.data.payload.channel,
      advisor: message.user,
      status: message.channelRoom.status,
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
        externalMessageId: message.data.payload.message.id as string,
        message: content,
        status: 'unread',
        attachments: [],
        time: new Date(newMessageSaved.dataValues.timestamp).toLocaleTimeString(
          'es-PE',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        fromMe: true,
      },
      botStatus: 'active',
    };
    this.multiChannelChatGateway.handleNewMessage(newMessage);
  }

  /** Envía saludos estándar si aplica */
  private async maybeSendGreetings(
    message: BufferedMessage,
    includeGreeting: boolean,
  ) {
    if (!includeGreeting) return;
    const greetings = [
      'Bienvenido al *SAT DE LIMA*',
      'Hola! Soy su asesor virtual 🤖',
    ];
    for (const g of greetings) {
      message.data.payload.message.body = g;
      await this.sendAndPersist(message, { type: 'text', text: g });
    }
  }

  /** Setea step + timeout en un solo lugar */
  private async setStepAndTimeout(
    phone: string,
    step: 'name' | 'documentType' | 'documentNumber' | 'confirmExistingData',
  ) {
    await this.redis.set(`user_step:${phone}`, step);
    await this.setBasicInfoTimeout(phone);
  }

  // =====================
  // Lógica principal
  // =====================

  // Verificar si tiene datos completos y válidos
  private hasCompleteData(citizen: ChannelCitizen): boolean {
    return !!(
      citizen.fullName &&
      citizen.documentType &&
      citizen.documentNumber
    );
  }

  public async handleBasicInfoMessage(
    message: BufferedMessage,
  ): Promise<{ handled: boolean }> {
    const phone = message.citizen.phoneNumber!;
    this.logger.debug('debug: ', message.data.payload);
    const body = (message.data.payload.message.body ?? '').trim();
    const citizen = message.citizen;

    try {
      this.logger.debug(`[${phone}] Procesando mensaje: "${body}"`);
      await this.redis.set(
        `buffered_message:${phone}`,
        JSON.stringify(message),
        'EX',
        650,
      );

      const inQueue = await this.isInBasicInfoQueue(phone!);
      const hasGreeted = await this.redis.get(`has_greeted:${phone}`);
      const step = await this.redis.get(`user_step:${phone}`);
      this.logger.debug(
        `[${phone}] Estado: inQueue=${inQueue}, hasGreeted=${hasGreeted}, step=${step}`,
      );

      if (!inQueue) {
        await this.redis.set(
          `user_state:${phone}`,
          'requestingBasicInformation',
        );
        await this.redis.set(`has_greeted:${phone}`, '1', 'EX', 3600);
        await this.requestBasicInformation(message);
        return { handled: true };
      }

      if (!step) {
        if (!hasGreeted) {
          await this.redis.set(`has_greeted:${phone}`, '1', 'EX', 3600);
          await this.requestBasicInformation(message);
        } else {
          await this.continueBasicInfoProcess(message);
        }
        return { handled: true };
      }

      if (step === 'confirmExistingData') {
        const result = await this.processDataConfirmation(body);
        if (result.confirmed === true) {
          await this.cleanupBasicInfoProcess(phone!);
          // entregamos al MessageBufferService
          (message.data.payload.message as any).body = 'Hola';
          await this.messageBufferService.addMessageToBuffer(message);
          await this.assistanceRepository.update(message.assistance.id, {
            status: ChannelAttentionStatus.IN_PROGRESS,
          });
          return { handled: false };
        } else if (result.confirmed === false) {
          await this.citizenRepository.update(citizen.id, {
            fullName: null,
            documentType: null,
            documentNumber: null,
          });
          citizen.fullName = null;
          citizen.documentType = null;
          citizen.documentNumber = null;
          await this.requestNewBasicInformation(message, false);
        } else {
          await this.sendMessageNotUnderstoodStatus(message, result.message);
          await this.requestDataConfirmation(message, false);
        }
        return { handled: true };
      }

      if (step === 'name') {
        this.logger.debug(`[${phone}] Agregando mensaje al buffer de nombres`);
        await this.redis.rpush(`name_buffer:${phone}`, JSON.stringify(message));
        this.resetBufferTimer(phone!);
        return { handled: true };
      } else if (step === 'documentType') {
        const result = await this.processDocumentType(citizen, body);
        if (result.success) {
          await this.requestDocumentNumber(message);
        } else {
          await this.sendMessageNotUnderstoodStatus(message, result.message);
          await this.setBasicInfoTimeout(phone!);
        }
        return { handled: true };
      } else if (step === 'documentNumber') {
        const result = await this.processDocumentNumber(citizen, body);
        if (result.success) {
          await this.cleanupBasicInfoProcess(phone!);
          (message.data.payload.message as any).body = 'Hola';
          await this.messageBufferService.addMessageToBuffer(message);
          await this.assistanceRepository.update(message.assistance.id, {
            status: ChannelAttentionStatus.IN_PROGRESS,
          });
          return { handled: false };
        } else {
          await this.sendMessageNotUnderstoodStatus(message, result.message);
          await this.setBasicInfoTimeout(phone!);
        }
        return { handled: true };
      }

      return { handled: true };
    } catch (error) {
      this.logger.error(`[${phone}] Error en handleBasicInfoMessage:`, error);
      await this.cleanupBasicInfoProcess(phone);
      throw error;
    }
  }

  private resetBufferTimer(phone: string) {
    this.logger.debug(
      `[${phone}] Reseteando timer del buffer (${this.bufferWaitTime}ms)`,
    );
    if (this.bufferTimeouts.has(phone)) {
      clearTimeout(this.bufferTimeouts.get(phone)!);
      this.logger.debug(`[${phone}] Timer anterior cancelado`);
    }
    const timeout = setTimeout(async () => {
      try {
        this.logger.debug(
          `[${phone}] Timer expirado, procesando buffer de nombres`,
        );
        await this.processNameBuffer(phone);
        this.bufferTimeouts.delete(phone);
      } catch (error) {
        this.logger.error(`[${phone}] Error en buffer timer:`, error);
        await this.cleanupBasicInfoProcess(phone);
      }
    }, this.bufferWaitTime);
    this.bufferTimeouts.set(phone, timeout);
    this.logger.debug(`[${phone}] Nuevo timer configurado`);
  }

  private async processNameBuffer(phone: string) {
    this.logger.debug(
      `[${phone}] Iniciando procesamiento del buffer de nombres`,
    );
    const jsonMsgs = await this.redis.lrange(`name_buffer:${phone}`, 0, -1);
    this.logger.debug(`[${phone}] Mensajes en buffer: ${jsonMsgs.length}`);
    if (jsonMsgs.length === 0) {
      await this.redis.set(
        `debug:${phone}:buffer_empty`,
        `${new Date().toISOString()} - Buffer was empty`,
        'EX',
        3600,
      );
      this.logger.warn(`[${phone}] Buffer de nombres vacío`);
      return;
    }

    const buffered: BufferedMessage[] = jsonMsgs.map((m) => JSON.parse(m));
    await this.redis.del(`name_buffer:${phone}`);

    const combinedBody = buffered
      .map((m) => m.data.payload.message.body)
      .join(' ')
      .trim();
    const lastMsg = buffered[buffered.length - 1];
    const citizen = lastMsg.citizen;

    this.logger.debug(`[${phone}] Nombre combinado: "${combinedBody}"`);

    const result = await this.processName(citizen, combinedBody);
    if (result.success) {
      this.logger.debug(
        `[${phone}] Nombre procesado exitosamente, solicitando tipo de documento`,
      );
      await this.requestDocumentType(lastMsg, false);
    } else {
      this.logger.debug(`[${phone}] Error en nombre: ${result.message}`);
      await this.sendMessageNotUnderstoodStatus(lastMsg, result.message);
      await this.setBasicInfoTimeout(phone);
    }
  }

  private async processDataConfirmation(body: string) {
    const cleanedBody = body.trim().toLowerCase();
    if (['si', 'sí', 'yes', 'correcto', 'ok', 's', 'y'].includes(cleanedBody)) {
      return { confirmed: true, message: '' };
    } else if (
      ['no', 'n', 'incorrecto', 'false', 'falso', 'nope'].includes(cleanedBody)
    ) {
      return { confirmed: false, message: '' };
    } else {
      return {
        confirmed: null,
        message:
          'Por favor responda *Sí* o *No* para confirmar si los datos son correctos.',
      };
    }
  }

  private async sendMessageNotUnderstoodStatus(
    message: BufferedMessage,
    reason: string,
  ) {
    message.data.payload.message.body = reason;
    await this.sendAndPersist(message, { type: 'text', text: reason });
  }

  private async processName(citizen: ChannelCitizen, body: string) {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const words = body
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    if (
      regex.test(body) &&
      words.length >= 2 &&
      words.every((word) => word.length >= 2)
    ) {
      await this.citizenRepository.update(citizen.id, {
        fullName: body.trim(),
      });
      citizen.fullName = body.trim();
      return { success: true, message: '' };
    } else {
      return {
        success: false,
        message:
          'Por favor, ingrese correctamente sus *nombres y apellidos completos* (mínimo 2 palabras)',
      };
    }
  }

  private async processDocumentType(citizen: ChannelCitizen, body: string) {
    const cleanedBody = body.trim().toUpperCase();
    if (['DNI', 'CE', 'OTROS', 'OTRO'].includes(cleanedBody)) {
      await this.citizenRepository.update(citizen.id, {
        documentType: cleanedBody as CitizenDocType,
      });
      citizen.documentType = cleanedBody as CitizenDocType;
      return { success: true, message: '' };
    } else {
      return {
        success: false,
        message:
          'Por favor, seleccione una opción válida: *DNI*, *CE* o *OTROS*',
      };
    }
  }

  private async processDocumentNumber(citizen: ChannelCitizen, body: string) {
    const value = body.trim();
    if (!value) {
      return { success: false, message: 'Ingrese un número de documento.' };
    }

    const currentCitizen = await this.citizenRepository.findById(citizen.id);
    const docType = (
      currentCitizen?.dataValues?.documentType || ''
    ).toUpperCase();
    this.logger.debug('-------------------debug----------------');

    this.logger.debug(docType);
    const digitsOnly = value.replace(/\D/g, '');

    let regex: RegExp;
    switch (docType) {
      case 'DNI':
        regex = /^\d{8}$/; // exactamente 8 dígitos
        break;
      case 'CE':
        regex = /^\d{9,12}$/; // entre 9 y 12 dígitos
        break;
      default:
        regex = /^\d{8,}$/; // mínimo 8
    }

    this.logger.debug(regex);

    if (regex.test(digitsOnly)) {
      await this.citizenRepository.update(citizen.id, {
        documentNumber: digitsOnly,
      });
      citizen.documentNumber = digitsOnly;
      return { success: true, message: '' };
    }

    const msg =
      docType === 'CE'
        ? 'Por favor, ingrese un Carné de Extranjería válido (9 a 12 dígitos).'
        : 'Por favor, ingrese un DNI válido (8 dígitos).';

    return { success: false, message: msg };
  }

  public async requestBasicInformation(message: BufferedMessage) {
    const citizen = message.citizen;
    if (this.hasCompleteData(citizen)) {
      await this.requestDataConfirmation(message, true);
    } else {
      await this.requestNewBasicInformation(message, true);
    }
  }

  private async continueBasicInfoProcess(message: BufferedMessage) {
    const citizen = message.citizen;
    if (this.hasCompleteData(citizen)) {
      await this.requestDataConfirmation(message, false);
    } else {
      await this.requestNewBasicInformation(message, false);
    }
  }

  private async requestDataConfirmation(
    message: BufferedMessage,
    includeGreeting: boolean = true,
  ) {
    const citizen = message.citizen;

    await this.maybeSendGreetings(message, includeGreeting);

    const summary =
      `Verificamos que te encuentras registrado en nuestro sistema. \n\n` +
      `📌Nombre: *${citizen.fullName}*\n` +
      `📌Tipo de documento: *${citizen.documentType}*\n` +
      `📌Número de documento: *${citizen.documentNumber}*\n`;

    // Luego el interactivo con botones
    const footerText = '¿Estos datos son correctos?';
    message.data.payload.message.body =
      summary + `\n*${footerText}*\n` + `- Si\n - No`;
    await this.sendAndPersist(
      message,
      {
        type: 'interactive',
        text: summary,
        buttons: [
          { id: 'id_affirmative', title: 'Si' },
          { id: 'id_negative', title: 'No' },
        ],
        footer: { text: footerText },
      },
      `${summary}\n- Si\n- No`,
    );

    await this.setStepAndTimeout(
      message.citizen.phoneNumber!,
      'confirmExistingData',
    );
  }

  private async requestNewBasicInformation(
    message: BufferedMessage,
    includeGreeting: boolean = true,
  ) {
    if (!message.citizen.fullName) {
      await this.requestName(message, includeGreeting);
    } else if (!message.citizen.documentType) {
      await this.requestDocumentType(message, includeGreeting);
    } else if (!message.citizen.documentNumber) {
      await this.requestDocumentNumber(message);
    }
  }

  private async requestName(
    message: BufferedMessage,
    includeGreeting: boolean = true,
  ) {
    await this.maybeSendGreetings(message, includeGreeting);
    const ask =
      'Por favor para una mejor atención, ingrese sus *nombres y apellidos completos*';
    message.data.payload.message.body = ask;
    await this.sendAndPersist(message, { type: 'text', text: ask });
    await this.setStepAndTimeout(message.citizen.phoneNumber!, 'name');
  }

  private async requestDocumentType(
    message: BufferedMessage,
    includeGreeting: boolean = false,
  ) {
    this.logger.debug(
      `[${message.citizen.phoneNumber}] Solicitando tipo de documento`,
    );

    await this.maybeSendGreetings(message, includeGreeting);

    const prompt = 'Ahora seleccione el tipo de su documento de identidad 🪪👇';
    message.data.payload.message.body = `${prompt}\n- *DNI*\n- *CE*\n- *OTROS*`;
    await this.sendAndPersist(
      message,
      {
        type: 'interactive',
        text: prompt,
        buttons: [
          { id: 'id_dni', title: 'DNI' },
          { id: 'id_ce', title: 'CE' },
          { id: 'id_other', title: 'OTROS' },
        ],
      },
      `${prompt}\n- *DNI*\n- *CE*\n- *OTROS*`,
    );

    await this.setStepAndTimeout(message.citizen.phoneNumber!, 'documentType');
    this.logger.debug(
      `[${message.citizen.phoneNumber}] Tipo de documento solicitado, step actualizado`,
    );
  }

  private async requestDocumentNumber(message: BufferedMessage) {
    const txt =
      'Ahora, escriba *el número de su documento* 🪪\nEjemplo: 12345678';
    message.data.payload.message.body = txt;
    await this.sendAndPersist(message, { type: 'text', text: txt });
    await this.setStepAndTimeout(
      message.citizen.phoneNumber!,
      'documentNumber',
    );
  }

  private async setBasicInfoTimeout(phone: string) {
    await this.redis.set(`basic_info_timeout:${phone}`, '1', 'EX', 600);
  }

  public async onBasicInfoTimeout(phone: string) {
    const bufferedMessageStr = await this.redis.get(
      `buffered_message:${phone}`,
    );
    if (!bufferedMessageStr) {
      await this.cleanupBasicInfoProcess(phone);
      return;
    }

    const bufferedMessage: BufferedMessage = JSON.parse(bufferedMessageStr);
    const assistance = await this.assistanceRepository.findById(
      bufferedMessage.assistance.id,
    );
    if (assistance.status !== ChannelAttentionStatus.CLOSED) {
      const closing =
        'Por tu seguridad estamos cerrando la conversación🔐.\nPuedes volver a escribirnos cuando desees, estamos para servirte 👋😄';
      bufferedMessage.data.payload.message.body = closing;
      await this.sendAndPersist(bufferedMessage, {
        type: 'text',
        text: closing,
      });

      await this.assistanceService.closeChannelAttention({
        assistanceId: bufferedMessage.assistance.id,
        channelRoomId: bufferedMessage.channelRoom.id,
      });
    }
    await this.cleanupBasicInfoProcess(phone);
  }

  public async isInBasicInfoQueue(phone: string): Promise<boolean> {
    const state = await this.redis.get(`user_state:${phone}`);
    return state === 'requestingBasicInformation';
  }

  public async cleanupBasicInfoProcess(phone: string) {
    this.logger.debug(`[${phone}] Iniciando limpieza del proceso`);

    if (this.bufferTimeouts.has(phone)) {
      clearTimeout(this.bufferTimeouts.get(phone)!);
      this.bufferTimeouts.delete(phone);
      this.logger.debug(`[${phone}] Timer de buffer cancelado`);
    }

    const keysToDelete = [
      `user_state:${phone}`,
      `user_step:${phone}`,
      `name_buffer:${phone}`,
      `buffered_message:${phone}`,
      `basic_info_timeout:${phone}`,
      `has_greeted:${phone}`,
      `debug:${phone}:buffer_empty`,
    ];

    try {
      const pipeline = this.redis.pipeline();
      keysToDelete.forEach((key) => pipeline.del(key));
      await pipeline.exec();
      this.logger.debug(`[${phone}] Limpieza completada`);
    } catch (error) {
      this.logger.error(`[${phone}] Error en limpieza:`, error);
      for (const key of keysToDelete) {
        try {
          await this.redis.del(key);
        } catch (keyError) {
          this.logger.warn(
            `[${phone}] Error eliminando clave ${key}:`,
            keyError,
          );
        }
      }
    }
  }
}
