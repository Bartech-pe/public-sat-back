import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber, IsOptional } from 'class-validator';

export class CloseChannelAttentionDto {
  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNumber({}, { message: v.isNumber('channelRoomId') })
  @IsOptional()
  channelRoomId?: number;

  @ApiProperty({ description: 'ID de la asistencia (Assitances)' })
  @IsNumber({}, { message: v.isNumber('assistanceId') })
  @IsOptional()
  assistanceId?: number;

  @ApiProperty({ description: 'ID de la asistencia (Assitances)' })
  @IsOptional()
  phoneNumber?: string;
}
