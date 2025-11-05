import { PartialType } from '@nestjs/swagger';
import { CreateReminderDto } from './create-reminder.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
