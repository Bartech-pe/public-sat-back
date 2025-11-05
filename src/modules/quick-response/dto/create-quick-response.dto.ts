import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateQuickResponseDto {
  @ApiProperty({
    description: 'title',
    example: 'title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'content',
    example: 'content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'quickResponseCategoryId',
    example: 0,
  })
  @IsNumber()
  quickResponseCategoryId: number;

  @ApiProperty({
    description: 'keywords',
    example: 'palo,see',
  })
  @IsOptional()
  @IsString({ message: v.isString('keywords') })
  // @Transform(({ value }) => String(value).split(','))
  keywords?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de la bandeja de entrada',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
