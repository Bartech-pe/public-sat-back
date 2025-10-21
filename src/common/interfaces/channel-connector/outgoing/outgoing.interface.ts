import { Channels } from "@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto";
import { ChannelType, MessageType } from "../messaging.interface";
import { MessageAttachment } from "@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto";


export interface OutgoingMessage {
  type: MessageType.OUTGOING;
  payload: OutgoingPayload;
}

export interface MessagingCredentials{
    accessToken?: string;
    phoneNumberId?: string;
}

export interface WhatsappOptionsButtons{
  id: string;
  title: string 
}
export interface WhatsappMessageOptions{
  type: "text" | "interactive";
  text?: string;
  buttons?: WhatsappOptionsButtons[];
  footer?: WhatsappFooterOptions;
}

export interface WhatsappFooterOptions
{
  text: string
}

export interface OutgoingPayload {
  channel: Channels;
  chat_id?:  string | number;
  lastMessageId?: string;
  assistanceId?: number;
  channelRoomId?: number;
  userId?: number | null;
  citizenId?: number;
  customMessage?: CustomMessage;
  credentials?: MessagingCredentials | null;
  attachments: MessageAttachment[]
  to: string;
  options?: WhatsappMessageOptions;
  botReply: boolean;
  phoneNumber?: string;
  message: string;
  timestamp: Date; 
}

export interface CustomMessage{
  type: string;
}
