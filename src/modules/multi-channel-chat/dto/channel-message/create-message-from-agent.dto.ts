import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Channels } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { Attachment } from '@common/interfaces/channel-connector/incoming/incoming.interface';

export class CreateChannelAgentMessageDto {
  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNotEmpty({ message: v.isNotEmpty('channelRoomId') })
  @IsNumber({}, { message: v.isNumber('channelRoomId') })
  channelRoomId: number;

  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNotEmpty({ message: v.isNotEmpty('assistanceId') })
  @IsNumber({}, { message: v.isNumber('assistanceId') })
  assistanceId: number;

  @ApiProperty({ description: 'ID de la sala del canal externo (ChannelRoom)' })
  @IsOptional()
  @IsString({ message: v.isString('externalChannelRoomId') })
  externalChannelRoomId?: string;

  @ApiProperty({ description: 'ID de la sala del canal externo (ChannelRoom)' })
  @IsOptional()
  @IsString({ message: v.isString('phoneNumberReceiver') })
  phoneNumberReceiver: string;

  @ApiProperty({ description: 'ID de la sala del canal externo (ChannelRoom)' })
  @IsOptional()
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber?: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Archivos adjuntos del mensaje' })
  @IsOptional()
  attachments: Attachment[];

  @ApiProperty({ description: 'AccessToken necesario' })
  @IsOptional()
  @IsString({ message: v.isString('accessToken') })
  accessToken?: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsNotEmpty({ message: v.isNotEmpty('channel') })
  channel: Channels;
}
