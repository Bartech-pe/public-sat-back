export class ChannelCitizen {
  id: number;
  avatar: string;
  name: string;
  fullName?: string;
  email?: string;
  alias?: string;
  phone?: string;
  lastSeen?: string;
  isActive?: boolean;
}

export class LastMessage {
  id?: number;
  channelRoomId?: number;
  externalMessageId?: String;
  message?: string;
  hasAttachment: boolean;
  citizen: ChannelCitizen;
  status?: 'read' | 'unread';
  fromMe?: boolean;
  time: Date;
  timestamp: number;
}
export interface ChannelSender {
  id: string;
  alias: string;
  fullName: string;
  avatar: string;
  isAgent: boolean;
  fromCitizen: boolean;
}
