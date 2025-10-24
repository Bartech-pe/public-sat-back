import {
  Channels,
  ChatStatus,
  MessageStatus,
} from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class GetChannelSummaryDto {
  @ApiProperty({ description: 'Estado del último mensaje', example: 'read' })
  @IsOptional()
  @IsString()
  @IsIn(['read', 'unread'])
  messageStatus?: 'read' | 'unread';

  @ApiProperty({ description: 'Estado del chat', example: 'completado' })
  @IsOptional()
  @IsString()
  @IsIn(['pendiente', 'prioridad', 'completado'])
  chatStatus?: 'pendiente' | 'prioridad' | 'completado';

  @ApiProperty({ description: 'Canal requerido', example: 'all' })
  @IsString()
  @IsIn([
    'all',
    'telegram',
    'whatsapp',
    'instagram',
    'messenger',
    'email',
    'sms',
    'chatsat',
  ])
  channel:
    | 'all'
    | 'telegram'
    | 'whatsapp'
    | 'instagram'
    | 'messenger'
    | 'email'
    | 'sms'
    | 'chatsat';

  @ApiProperty({ description: 'Buscador del list', example: '962617' })
  @IsOptional()
  @IsString()
  search?: string;


  @ApiProperty({ description: 'Delimitador de chats propios', example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => {
    const rawValue = obj?.allChats;
    
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }
    
    if (typeof rawValue === 'string') {
      const normalized = rawValue.toLowerCase().trim();
      return normalized === 'true' || normalized === '1';
    }
    
    return Boolean(rawValue);
  })
  allChats?: boolean;
}
