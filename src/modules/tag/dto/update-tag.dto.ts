import { PartialType } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

import { IsNumber } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}

