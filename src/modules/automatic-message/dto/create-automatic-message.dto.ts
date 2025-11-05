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

export class CreateAutomaticMessageDto {
  @ApiProperty({ example: 'estado', description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Descripción del estado',
  })
  @IsOptional()
  message_descriptions?: string[];

  @ApiProperty({ description: 'Categoría del estado' })
  @IsNumber({}, { message: v.isNumber('categoryId') })
  @IsNotEmpty({ message: v.isNotEmpty('categoryId') })
  categoryId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del mensaje (booleano)',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
