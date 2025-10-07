import { IsNotEmpty, IsNumber, IsDate, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ChannelAttentionStatus } from '@modules/multi-channel-chat/entities/channel-attention.entity';

export class CreateAssistanceDto {
  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNotEmpty({ message: v.isNotEmpty('channelRoomId') })
  @IsNumber({}, { message: v.isNumber('channelRoomId') })
  channelRoomId: number;

  @ApiProperty({
    description:
      'Estado de la asistencia (identity_verification | in_progress | closed)',
    enum: ChannelAttentionStatus,
    default: ChannelAttentionStatus.IDENTITY_VERIFICATION,
  })
  @IsEnum(ChannelAttentionStatus, { message: v.isEnum('status') })
  status: ChannelAttentionStatus;

  @ApiProperty({ description: 'Inicio de la asistencia' })
  @IsNotEmpty({ message: v.isNotEmpty('startDate') })
  @IsDate({ message: v.isDate('startDate') })
  startDate: Date;
}
