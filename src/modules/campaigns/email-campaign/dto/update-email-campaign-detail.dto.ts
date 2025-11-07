import { PartialType } from '@nestjs/swagger';
import { CreateEmailCampaignDetailDto } from './create-email-campaign-detail.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateEmailCampaignDetailDto extends PartialType(
  CreateEmailCampaignDetailDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
