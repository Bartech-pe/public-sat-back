import { PartialType } from '@nestjs/swagger';
import { CreateConsultTypeDto } from './create-consult-type.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateConsultTypeDto extends PartialType(CreateConsultTypeDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
