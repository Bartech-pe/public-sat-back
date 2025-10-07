export enum ChannelType {
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  CHATSAT = 'chatsat',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum MessageType {
  INCOMING = 'message.incoming',
  OUTGOING = 'message.outgoing',
  CONVERSATION_STATUS = 'conversation.status',
  SESSION_STATUS = 'session.status',
}

export enum MessageStatus {
  SEEN = 'seen',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum ChannelStatus {
  CONNECTED = 'connected',
  AUTH_FAILURE = 'auth_failure',
  DISCONNECTED = 'disconnected',
}
