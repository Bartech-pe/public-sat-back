import { ChannelRoomMessage } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

export interface MessagesResponseDto {
  channelRoomId: number;
  assistanceId: number;
  messages: ChannelRoomMessage[];
}

export interface ChannelAttentionDto {
  assistanceId: number;
  channelRoomId: number;
  lastMessage: ChannelRoomMessage;
  channel?: string;
  startDate?: string;
  endDate?: string | null;
  status?: string;
  user?: string;
  citizen?: string;
}
