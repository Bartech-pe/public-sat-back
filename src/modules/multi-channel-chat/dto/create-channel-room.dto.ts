import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ChatStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

export class CreateChannelRoomDto {
  @ApiProperty({ description: 'ID externo del canal (ej. chatId de Telegram)' })
  @IsOptional()
  @IsString({ message: v.isString('externalChannelRoomId') })
  externalChannelRoomId: string;

  @ApiProperty({ description: 'ID del inbox relacionado' })
  @IsNotEmpty({ message: v.isNotEmpty('inboxId') })
  @IsNumber({}, { message: v.isNumber('inboxId') })
  inboxId: number;

  @ApiProperty({ description: 'ID del ciudadano' })
  @IsNotEmpty({ message: v.isNotEmpty('channelCitizenId') })
  @IsNumber({}, { message: v.isNumber('channelCitizenId') })
  channelCitizenId: number;

  @ApiProperty({ description: 'ID del agente asignado' })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId?: number| null;

  @ApiProperty({
    description: 'Estado del canal',
    enum: ['pendiente', 'prioridad', 'completado'],
  })
  @IsEnum(['pendiente', 'prioridad', 'completado'], {
    message: v.isEnum('status'),
  })
  status: ChatStatus;

  @ApiProperty({ description: 'Indica si responde un bot' })
  @IsNotEmpty({ message: v.isNotEmpty('botReplies') })
  @IsBoolean({ message: v.isBoolean('botReplies') })
  botReplies: boolean;

  @ApiPropertyOptional({ description: 'Fecha de creación' })
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Fecha de actualización' })
  @IsOptional()
  updatedAt?: Date;
}
