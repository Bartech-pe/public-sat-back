import { PartialType } from '@nestjs/swagger';
import { CreateCampaignScheduleDto } from './create-campaign-schedule.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';

import { IsNumber } from 'class-validator';

export class UpdateCampaignScheduleDto extends PartialType(
  CreateCampaignScheduleDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
