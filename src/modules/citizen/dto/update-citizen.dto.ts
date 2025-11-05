import { PartialType } from '@nestjs/swagger';
import { CreateCitizenDto } from './create-citizen.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateCitizenDto extends PartialType(CreateCitizenDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
