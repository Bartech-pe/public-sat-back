import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoAtencion } from '../entities/estado-atencion.entity';

export class CreateEstadoAtencionDto {
  @ApiProperty({ example: 'estado', description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('nombre') })
  @IsString({ message: v.isString('nombre') })
  @IsUnique(EstadoAtencion, 'nombre', { message: v.isUnique('nombre') })
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

  // @IsOptional()
  // @IsBoolean({ message: v.isBoolean('estado-campania') })
  // @Transform(({ value }) => value === 'true' || value === true)
  // status?: boolean;
}
