import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoCanal } from '../entities/estado-canal.entity';

export class CreateEstadoCanalDto {
  @ApiProperty({ example: 'estado', description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('nombre') })
  @IsString({ message: v.isString('nombre') })
  nombre: string;

  @ApiPropertyOptional({
    example: 'azul',
    description: 'Color del estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('color') })
  color?: string;

  @ApiPropertyOptional({
    example: 'Descripción del estado',
    description: 'Descripción de lo que representa este estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('descripcion') })
  descripcion?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Tipo del estado (booleano)',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('tipo') })
  @Transform(({ value }) => value === 'true' || value === true)
  tipo?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Categoría del estado',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('categoria') })
  @Transform(({ value }) => (value ? Number(value) : null))
  categoria?: number;
}
