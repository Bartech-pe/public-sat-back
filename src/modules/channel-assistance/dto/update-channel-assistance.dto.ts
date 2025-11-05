import { PartialType } from '@nestjs/swagger';
import { CreateChannelAssistanceDto } from './create-channel-assistance.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateChannelAssistanceDto extends PartialType(CreateChannelAssistanceDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
