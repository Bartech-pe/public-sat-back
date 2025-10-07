import { IsDate, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateHolidayDto {
  @ApiProperty({ description: 'Fecha de inicio de la campaña' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('startDate') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  })
  startTime: Date;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
