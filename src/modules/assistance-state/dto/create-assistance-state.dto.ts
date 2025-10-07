import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AssistanceState } from '../entities/assistance-state.entity';
import { IsUniqueComposite } from '@common/validators/is-unique-composite/is-unique-composite.decorator';

export class CreateAssistanceStateDto {
  @IsUniqueComposite(
    {
      model: AssistanceState,
      fields: ['name', 'categoryId'],
    },
    {
      message: 'Ya existe el estado para esta canal',
    },
  )
  readonly uniqueCheck: string;

  @ApiProperty({ description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de lo que representa este estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({
    description: 'Color del estado',
  })
  @IsString({ message: v.isString('color') })
  color?: string;

  @ApiPropertyOptional({ description: 'Icono del estado' })
  @IsOptional()
  @IsString({ message: v.isString('icon') })
  icon?: string;

  @ApiProperty({
    description: 'Categoría del estado',
  })
  @IsNumber({}, { message: v.isNumber('categoryId') })
  @IsNotEmpty({ message: v.isNotEmpty('categoryId') })
  categoryId?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
