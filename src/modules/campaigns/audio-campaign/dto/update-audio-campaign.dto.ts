import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioCampaignDto } from './create-audio-campaign.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateAudioCampaignDto extends PartialType(
  CreateAudioCampaignDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
