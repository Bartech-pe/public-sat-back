import { PartialType } from '@nestjs/swagger';
import { CreateChannelDto } from './create-channel.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
