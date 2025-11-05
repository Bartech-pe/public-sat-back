import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateChannelUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('channelId') })
  channelId: number;

  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;
}
