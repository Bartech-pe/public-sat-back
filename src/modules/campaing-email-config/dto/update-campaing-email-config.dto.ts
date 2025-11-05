import { PartialType } from '@nestjs/swagger';
import { CreateCampaingEmailConfigDto } from './create-campaing-email-config.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateCampaingEmailConfigDto extends PartialType(CreateCampaingEmailConfigDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
