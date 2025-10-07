import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateChannelMessageAttachmentDto {
  @ApiProperty({ description: 'ID del mensaje del canal asociado' })
  @IsNotEmpty({ message: v.isNotEmpty('channelMessageId') })
  @IsNumber({}, { message: v.isNumber('channelMessageId') })
  channelMessageId: number;

  @ApiProperty({
    description: 'Contenido del archivo en base64',
    example: 'iVBORw0KGgoAAAANSUhEUgAA...',
  })
  @IsNotEmpty({ message: v.isNotEmpty('content') })
  @IsString({ message: v.isString('content') })
  content: string;

  @ApiProperty({
    description: 'Extensión del archivo (png, jpg, pdf, etc.)',
    example: 'png',
  })
  @IsNotEmpty({ message: v.isNotEmpty('extension') })
  @IsString({ message: v.isString('extension') })
  extension: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 204800,
  })
  @IsNotEmpty({ message: v.isNotEmpty('size') })
  @IsNumber({}, { message: v.isNumber('size') })
  size: number;

  @ApiProperty({
    description: 'Tipo de archivo',
    enum: ['file', 'image'],
    example: 'image',
  })
  @IsNotEmpty({ message: v.isNotEmpty('type') })
  @IsEnum(['file', 'image'], { message: v.isEnum('type') })
  type: 'file' | 'image';
}
