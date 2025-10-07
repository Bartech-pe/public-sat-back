import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
