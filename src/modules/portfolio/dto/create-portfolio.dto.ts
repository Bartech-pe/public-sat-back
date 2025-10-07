import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsDate } from 'class-validator';
import { CreatePortfolioDetailDto } from '@modules/portfolio-detail/dto/create-portfolio-detail.dto';

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

  @ApiProperty({ example: 15000.5, description: 'Monto total' })
  @IsNumber({}, { message: v.isNumber('amount') })
  amount: number;

  @ApiProperty({ example: true, description: 'Estado' })
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status: boolean;

  @IsArray()
  @ValidateNested({ each: true }) // Validar cada objeto del array
  @Type(() => CreatePortfolioDetailDto) // Transformar cada objeto a DetallePortfolioDTO
  detalles: CreatePortfolioDetailDto[];
}
