import { PartialType } from '@nestjs/swagger';
import { CreateEmailCampaignDto } from './create-email-campaign.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateEmailCampaignDto extends PartialType(
  CreateEmailCampaignDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
