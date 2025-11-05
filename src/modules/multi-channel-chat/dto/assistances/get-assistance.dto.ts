import { MessageStatus } from "@common/interfaces/channel-connector/messaging.interface";
import { ChannelRoomMessage } from "@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto";
import { ChannelMessage } from "@modules/multi-channel-chat/entities/channel-message.entity";

export interface MessagesResponseDto {
	channelRoomId: number;
	assistanceId: number;
	messages: ChannelRoomMessage[];
}


export interface ChannelAssistanceDto {
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