import { Attachment } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import { ChannelCitizen } from '../channel-citizen/channel-citizen.interface';

export type ChatStatus = 'pendiente' | 'prioridad' | 'completado';
export type MessageStatus = 'read' | 'unread';
export type Channels =
  | 'all'
  | 'telegram'
  | 'whatsapp'
  | 'instagram'
  | 'messenger'
  | 'email'
  | 'sms'
  | 'chatsat';
export type BotStatus = 'paused' | 'active' | 'out';
export type CitizenDocType = 'DNI' | 'CE' | 'OTROS';
export class ChannelChatDetail {
  channelRoomId: number;
  channel: Channels;
  status: ChatStatus;
  assistanceId: number;
  externalRoomId: string;
  botStatus: BotStatus;
  citizen: ChannelCitizen;
  agentAssigned?: ChannelAgent;
  messages: ChannelRoomMessage[];
}

export class ChannelUser {
  id?: number;
  externalUserId?: string;
  alias?: string;
  fullName?: string | null;
  documentNumber?: string | null;
  documentType?: CitizenDocType | null;
  avatar?: string;
  isAgent?: boolean;
  fromCitizen?: boolean;
  email?: string;
  phone?: string;
  lastSeen?: string;
  isActive?: boolean;
}

export class ChannelRoomMessage {
  id: number;
  channelRoomId?: number;
  content: string;
  attachments: Attachment[];
  status: MessageStatus;
  sender: ChannelUser;
  time: string;
  timestamp?: Date;
  externalMessageId?: string;
  fromMe?: boolean;
}

export class ChannelAgent {
  id: number;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  alias?: string;
  email?: string;
}
