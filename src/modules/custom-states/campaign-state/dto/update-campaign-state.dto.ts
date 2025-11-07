import { PartialType } from '@nestjs/swagger';
import { CreateCampaignStateDto } from './create-campaign-state.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateCampaignStateDto extends PartialType(
  CreateCampaignStateDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
