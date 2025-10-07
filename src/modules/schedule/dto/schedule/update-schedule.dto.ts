import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { CreateHolidayDto } from '../holiday/create-holiday.dto';

export class UpdateScheduleDto extends PartialType(CreateHolidayDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
