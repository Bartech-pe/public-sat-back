import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateHolidayDto } from './create-holiday.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { PartialType } from '@nestjs/swagger';

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
