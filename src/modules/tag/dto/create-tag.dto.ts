import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Tag } from '../entities/tag.entity';

export class CreateTagDto {
  @ApiProperty({ example: 'etiquetas', description: 'Nombre de etiquetas' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Tag, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'descripción',
    description: 'descripción del etiqueta',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiPropertyOptional({
    example: 'azul',
    description: 'Color del estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('color') })
  color: string;


  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
