import { PartialType } from '@nestjs/swagger';
import { CreateOficinaDto } from './create-oficina.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateOficinaDto extends PartialType(CreateOficinaDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
