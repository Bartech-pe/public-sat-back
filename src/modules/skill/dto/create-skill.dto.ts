import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSkillDto {
  @ApiProperty({ description: 'Nombre del equipo' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  name: string;

  @ApiProperty({
    example: 'Encargado de asesorar',
    description: 'Categoría',
  })
  @IsString({ message: v.isString('category') })
  category: string;

  @ApiProperty({
    example: 'Encargado de asesorar',
    description: 'Descripción del equipo',
  })
  @IsString({ message: v.isString('description') })
  description: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
