import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MensajeAutomatico } from '../entities/mensaje-automatico.entity';

export class CreateMensajeAutomaticoDto {
  @ApiProperty({ example: 'estado', description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('nombre') })
  @IsString({ message: v.isString('nombre') })
  // @IsUnique(MensajeAutomatico, 'nombre', { message: v.isUnique('nombre') })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Descripción del estado',
    description: 'Descripción de lo que representa este estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('descripcion') })
  descripcion?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del mensaje (booleano)',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('estado') })
  @Transform(({ value }) => value === 'true' || value === true)
  estado?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Tipo de lo que representa este mensaje',
  })
  @IsOptional()
  @IsString({ message: v.isString('tipo') })
  tipo?: number;
}
