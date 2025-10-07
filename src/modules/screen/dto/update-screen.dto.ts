import { PartialType } from '@nestjs/swagger';
import { CreateScreenDto } from './create-screen.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateScreenDto extends PartialType(CreateScreenDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
