import { PartialType } from '@nestjs/mapped-types';
import { CreateSmsCampaignDetail } from './create-sms-campaign-detail.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateSmsCampaignDetail extends PartialType(
  CreateSmsCampaignDetail,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
