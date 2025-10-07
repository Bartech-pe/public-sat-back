import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignTypeDto } from './create-campaign-type.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateCampaignTypeDto extends PartialType(CreateCampaignTypeDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
