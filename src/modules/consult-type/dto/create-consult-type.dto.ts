import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ConsultType } from '../entities/consult-type.entity';

export class CreateConsultTypeDto {
  @ApiProperty({ description: 'Nombre del tipo de consulta' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiProperty({ description: 'Código del tipo de consulta' })
  @IsNotEmpty({ message: v.isNotEmpty('code') })
  @IsString({ message: v.isString('code') })
  @IsUnique(ConsultType, 'code', { message: 'Ya existe un registro con el mismo código' })
  code: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'El tipo de consulta es genérico' })
  @IsBoolean({ message: v.isBoolean('generic') })
  @Transform(({ value }) => value === 'true' || value === true)
  generic?: boolean;
}
