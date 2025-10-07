import { PartialType } from '@nestjs/mapped-types';
import { CreateSmsCampaing } from './create-sms-campaing.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateSmsCampaing extends PartialType(CreateSmsCampaing) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
