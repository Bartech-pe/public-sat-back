import { PartialType } from '@nestjs/swagger';
import { CreateTemplateEmailDto } from './create-template-email.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';

import { IsNumber } from 'class-validator';

export class UpdateTemplateEmailDto extends PartialType(CreateTemplateEmailDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
