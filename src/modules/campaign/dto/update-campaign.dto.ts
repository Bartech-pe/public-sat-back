import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
