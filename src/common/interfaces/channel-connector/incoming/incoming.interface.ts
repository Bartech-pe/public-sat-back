import { ChannelType, MessageType } from '../messaging.interface';

export interface IncomingMessage {
  type: MessageType.INCOMING;
  payload: IncomingPayload;
  token?: string;
}

export interface Participant {
  id?: string | number;
  full_name?: string;
  alias?: string;
  phone_number?: string;
  email?: string;
  status?: string;
  avatar?: string;
}
export interface Message {
  id: string | number;
  body?: string | null;
  botReply?: boolean;
}

export interface IncomingPayload {
  channel: ChannelType;
  chat_id: string | number;
  sender: Participant;
  token?: string;
  fromMe?: boolean;
  receiver: Participant;
  message: Message;
  attachments?: Attachment[];
  timestamp: string | number;
}

export interface Attachment {
  type: 'file' | 'image';
  name?: string;
  extension?: string | null;
  content?: string | null;
}
