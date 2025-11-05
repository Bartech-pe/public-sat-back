import { PartialType } from '@nestjs/swagger';
import { CreateAutomaticMessageDto } from './create-automatic-message.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateAutomaticMessageDto extends PartialType(
  CreateAutomaticMessageDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
