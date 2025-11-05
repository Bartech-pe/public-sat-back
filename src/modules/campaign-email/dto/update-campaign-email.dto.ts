import { PartialType } from '@nestjs/swagger';
import { CreateCampaignEmailDto } from './create-campaign-email.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateCampaignEmailDto extends PartialType(CreateCampaignEmailDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
