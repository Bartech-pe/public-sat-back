import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class RasaLine {
  recipient_id: number;
  text?: string;
}
export class RasaResponse extends RasaLine {
  image?: string;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  elements?: any[];
  custom?: any;
}
export class RasaMessage {
  metadata?: Record<string, any>;
  sender: string;
  message: string;
}
export class RasaBase extends RasaLine {
  buttons?: any[];
  reply_markup?: any;
}
export class RasaDto {
  senderId: number;
  message: string;
}
export class SendMessageRasaDto {
  @ApiProperty({
    description: 'sender',
    example: 'channelExample',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;
  @ApiProperty({
    description: 'message',
    example: 'hola',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    description: 'channel',
    example: 'whatsapp',
  })
  @IsString()
  @IsNotEmpty()
  channel: string;
  @ApiProperty({
    description: 'metadata',
    example: {
      phone: '+51987654321',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
export class SendMessageHookDto {
  @ApiProperty({
    description: 'sender',
    example: 'channelExample',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;
  @ApiProperty({
    description: 'message',
    example: 'hola',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    description: 'metadata',
    example: {
      phone: '+51987654321',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
