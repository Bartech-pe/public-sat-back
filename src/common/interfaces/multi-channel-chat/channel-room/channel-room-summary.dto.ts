import { LastMessage } from '../channel-citizen/channel-citizen.interface';
import {
  BotStatus,
  Channels,
  ChannelUser,
  ChatStatus,
} from '../channel-message/channel-chat-message.dto';

export class ChannelRoomSummaryDto {
  channelRoomId: number;
  attention: ChannelAttentionSummariesDTO;
  externalRoomId?: string;
  channel: string;
  lastMessage: LastMessage;
  status: ChatStatus;
  advisor: AdvisorAssigned;
  unreadCount: number;
  botStatus: BotStatus;
}

export interface ChannelAttentionSummariesDTO{
  id: number;
  endDate?: Date | null;
  consultTypeId?: number | null;
  attentionDetail?: string |  null;
}
export interface AdvisorAssigned {
  id: number;
  name: string;
}

export interface ChannelRoomViewStatusDto {
  channelRoomId: number;
  channel: Channels;
  readCount: number;
}

export interface ChannelRoomViewStatusDto {
  channelRoomId: number;
  channel: Channels;
  readCount: number;
}

export class ChannelRoomNewMessageDto {
  channelRoomId: number;
  attention: ChannelAttentionSummariesDTO;
  externalRoomId?: string;
  channel?: string;
  advisor: AdvisorAssigned;
  message: Message;
  status?: ChatStatus;
  unreadCount?: number;
  botStatus?: BotStatus;
}
export interface Message {
  id?: number;
  channelRoomId?: number;
  externalMessageId?: String;
  message?: string;
  sender?: ChannelUser;
  attachments: MessageAttachment[];
  status?: 'read' | 'unread';
  time?: string;
  fromMe?: boolean;
}

export interface MessageAttachment {
  id?: number;
  size?: number;
  type: 'file' | 'image';
  name: string;
  content: string;
  extension: string;
}
