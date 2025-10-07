import { PredefinedResponse } from './../entities/predefined-response.entity';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';

export class CreatePredefinedResponseDto {
  @ApiProperty({ example: 'codigo', description: 'Código corto' })
  @IsNotEmpty({ message: v.isNotEmpty('code') })
  @IsString({ message: v.isString('code') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(PredefinedResponse, 'code', { message: v.isUnique('code') })
  code: string;

  @ApiProperty({
    description: 'Título de la respuesta predefinida',
  })
  @IsNotEmpty({ message: v.isNotEmpty('title') })
  @IsString({ message: v.isString('title') })
  title: string;

  @ApiProperty({
    description: 'Contenido de la respuesta predefinida',
  })
  @IsNotEmpty({ message: v.isNotEmpty('content') })
  @IsString({ message: v.isString('content') })
  content: string;

  @ApiProperty({
    description: 'Palabras clave asociadas a la respuesta predefinida',
  })
  @IsArray()
  @ValidateNested({ each: true }) // Validar cada objeto del array
  keywords: string;

  @ApiProperty({ description: 'Categoría del estado' })
  @IsNumber({}, { message: v.isNumber('categoryId') })
  @IsNotEmpty({ message: v.isNotEmpty('categoryId') })
  categoryId?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
