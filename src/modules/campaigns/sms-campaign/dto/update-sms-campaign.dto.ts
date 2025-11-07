import { PartialType } from '@nestjs/mapped-types';
import { CreateSmsCampaignDto } from './create-sms-campaign.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateSmsCampaignDto extends PartialType(CreateSmsCampaignDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
