import { PartialType } from '@nestjs/swagger';
import { CreateEstadoCanalDto } from './create-estado-canal.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateEstadoCanalDto extends PartialType(CreateEstadoCanalDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
