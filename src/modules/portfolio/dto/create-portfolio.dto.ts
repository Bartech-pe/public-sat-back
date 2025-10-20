import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsDate } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({
    example: 'Campaña Julio',
    description: 'Nombre de la cartera',
  })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Campaña de cobros',
    description: 'Descripción',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({ description: 'Fecha de inicio' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('dateStart') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  })
  dateStart: Date;

  @ApiProperty({ description: 'Fecha de fin' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('dateEnd') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  })
  dateEnd: Date;

  @ApiPropertyOptional({ description: 'id de la oficina asignado' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('officeId') })
  officeId: number;
}
