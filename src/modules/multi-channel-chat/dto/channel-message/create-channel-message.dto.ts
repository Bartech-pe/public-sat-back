import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  isString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateChannelMessageDto {
  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNotEmpty({ message: v.isNotEmpty('channelRoomId') })
  @IsNumber({}, { message: v.isNumber('channelRoomId') })
  channelRoomId: number;

  @ApiProperty({ description: 'User agent ID' })
  @IsNotEmpty({ message: v.isNotEmpty('userId') })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @ApiProperty({ description: 'ID de la asistencia' })
  @IsNotEmpty({ message: v.isNotEmpty('assistanceId') })
  @IsNumber({}, { message: v.isNumber('assistanceId') })
  assistanceId: number;

  @ApiProperty({ description: 'ID de la sala del canal externo (ChannelRoom)' })
  @IsOptional()
  @IsString({ message: v.isString('externalChannelRoomId') })
  externalChannelRoomId?: number;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Estado de lectura del mensaje',
    enum: ['read', 'unread'],
    default: 'unread',
  })
  @IsEnum(['read', 'unread'], { message: v.isEnum('status') })
  status: 'read' | 'unread' = 'unread';

  @ApiProperty({ description: 'ID del mensaje externo' })
  @IsOptional()
  externalMessageId?: string;

  @ApiProperty({
    description: 'Tipo de remitente',
    enum: ['agent', 'citizen', 'bot'],
  })
  @IsNotEmpty({ message: v.isNotEmpty('senderType') })
  @IsEnum(['agent', 'citizen', 'bot'], { message: v.isEnum('senderType') })
  senderType: 'agent' | 'citizen' | 'bot';

  @ApiProperty({ description: 'Fecha y hora del mensaje (timestamp)' })
  @IsNotEmpty({ message: v.isNotEmpty('timestamp') })
  @IsDate({ message: v.isDate('timestamp') })
  timestamp: Date;
}
