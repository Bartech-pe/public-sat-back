import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Oficina } from '../entities/oficina.entity';

export class CreateOficinaDto {
  @ApiProperty({ description: 'Nombre del oficina' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @IsUnique(Oficina, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del oficina',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({ description: 'id del área asignado' })
  @IsNumber({}, { message: v.isNumber('idArea') })
  idArea: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
