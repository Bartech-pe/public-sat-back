import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Screen } from '../entities/screen.entity';
export class CreateScreenDto {
  @ApiProperty({ example: 'Ajustes', description: 'Nombre de la pantalla' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Screen, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Pantalla de agrupación de ajustes',
    description: 'Descripción de la pantalla',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiPropertyOptional({
    example: '/settings',
    description: 'Url de la pantalla',
  })
  @IsNotEmpty({ message: v.isNotEmpty('url') })
  @IsString({ message: v.isString('url') })
  url: string;

  @ApiPropertyOptional({
    example: 'lucide:bolt',
    description: 'Icono de la pantalla https://icon-sets.iconify.design/',
  })
  @IsOptional()
  @IsString({ message: v.isString('icon') })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Id de la pantalla padre',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('idParent') })
  idParent?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
