import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConversationEvent {
  event: string;
  timestamp: number;
  text?: string;
  parse_data?: any;
  input_channel?: string;
  message_id?: string;
  metadata?: any;
}
export class Intent {
  name: string;
  confidence: number;
}
export class LatestMessage {
  text: string;
  entities: any[];
  intent: Intent;
}
export class ConversationTracker {
  sender_id: number;
  slots: Record<string, any>;
  latest_message: LatestMessage;
  events: ConversationEvent[];
  paused: boolean;
  followup_action?: string;
  active_loop?: any;
}
export class ConversationStatus {
  messageCount: number;
  isPaused: boolean;
  lastActivity: string;
  currentIntent?: string;
}

export class CreateConversationDto {
  @ApiProperty({
    description: 'sender',
    example: 'channelExample',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;
  @ApiProperty({
    description: 'initial',
    example: 'hola',
  })
  @IsString()
  @IsNotEmpty()
  intial: string;
  @ApiProperty({
    description: 'channel',
    example: 'whatsapp',
  })
  @IsString()
  @IsNotEmpty()
  channel: string;
}
