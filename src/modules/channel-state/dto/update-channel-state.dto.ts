import { PartialType } from '@nestjs/swagger';
import { CreateChannelStateDto } from './create-channel-state.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateChannelStateDto extends PartialType(
  CreateChannelStateDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
