import { ChannelStatus, ChannelType, MessageType } from "../messaging.interface";

export interface SessionStatusMessage {
  type: MessageType.SESSION_STATUS;
  payload: SessionStatusPayload;
}

export interface SessionStatusPayload {
  channel: ChannelType;
  sessionId: number;
  status: ChannelStatus;
  timestamp: string; 
}