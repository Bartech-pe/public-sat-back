import { PartialType } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

import { IsNumber } from 'class-validator';
import { CreateTagsDto } from './create-tag.dto';

export class UpdateTagsDto extends PartialType(CreateTagsDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}

