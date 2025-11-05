import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class ToogleBotServicesDto {
  @ApiProperty({ description: 'ID de la sala del canal (ChannelRoom)' })
  @IsNotEmpty({ message: v.isNotEmpty('channelroomId') })
  @IsNumber({}, { message: v.isNumber('channelroomId') })
  channelroomId: number;

  @ApiProperty({ description: 'Indica si está activo o no' })
  @IsNotEmpty({ message: v.isNotEmpty('active') })
  @IsBoolean({ message: v.isBoolean('active') })
  active: boolean;
}
