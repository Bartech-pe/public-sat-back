import { PartialType } from '@nestjs/swagger';
import { CreateOfficeDto } from './create-office.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateOfficeDto extends PartialType(CreateOfficeDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
