import { ChatStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class changeChannelRoomStatusDto {
  @ApiProperty({ description: 'ID del canal', example: 1 })
  @IsNotEmpty({ message: v.isNotEmpty('channelroomId') })
  @IsNumber({}, { message: v.isNumber('channelroomId') })
  channelRoomId: number;

  @ApiProperty({ description: 'ID de la asistencia', example: 1 })
  @IsNotEmpty({ message: v.isNotEmpty('assistanceId') })
  @IsNumber({}, { message: v.isNumber('assistanceId') })
  assistanceId: number;

  @ApiProperty({ description: 'Estado del chat', example: false })
  @IsNotEmpty({ message: v.isNotEmpty('status') })
  status: ChatStatus;
}
