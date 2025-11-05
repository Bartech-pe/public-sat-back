import { PartialType } from '@nestjs/mapped-types';
import { CreateCarteraDto } from './create-cartera.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
export class UpdateCarteraDto extends PartialType(CreateCarteraDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
