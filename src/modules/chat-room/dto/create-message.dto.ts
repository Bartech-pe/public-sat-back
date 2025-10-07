import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Tipo de mensaje: texto, imagen, archivo, audio, video.',
    enum: MessageType,
  })
  @IsEnum(MessageType, { message: v.isEnum('type') })
  type: MessageType;

  @ApiPropertyOptional({
    description: 'Contenido del mensaje (puede ser vacío en mensajes tipo imagen o archivo)',
  })
  @IsOptional()
  @IsString({ message: v.isString('content') })
  content?: string;

  @ApiProperty({
    description: 'ID del chat asociado',
    example: 1,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: v.isNumber('chatRoomId') })
  chatRoomId: number;

  @ApiProperty({
    description: 'Indica si el mensaje ha sido leído',
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: v.isBoolean('isRead') })
  isRead: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el usuario actual es el emisor (opcional, se puede inferir desde el backend)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: v.isBoolean('isSender') })
  isSender?: boolean;

  @ApiPropertyOptional({
    description: 'URL o ruta del recurso adjunto (si aplica)',
  })
  @IsOptional()
  @IsString({ message: v.isString('resourceUrl') })
  resourceUrl?: string;
}
