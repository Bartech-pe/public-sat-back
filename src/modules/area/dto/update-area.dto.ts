import { PartialType } from '@nestjs/swagger';
import { CreateAreaDto } from './create-area.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
