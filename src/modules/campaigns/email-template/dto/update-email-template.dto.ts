import { PartialType } from '@nestjs/swagger';
import { CreateEmailTemplateDto } from './create-email-template.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';

import { IsNumber } from 'class-validator';

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
