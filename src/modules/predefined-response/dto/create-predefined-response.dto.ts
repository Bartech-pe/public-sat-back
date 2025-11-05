import { PredefinedResponse } from './../entities/predefined-response.entity';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({
    example: 'por favor',
    description: 'mensaje',
  })
  @IsOptional()
  @IsString({ message: v.isString('message') })
  message?: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

}
