import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { InformacionCasoDto } from './informacion-caso.dto';
import { Type } from 'class-transformer';

export class CreateCarteraDetalleDto {
  @ApiProperty({
    description: 'ID del documento',
    required: false, // Swagger lo marca como opcional
  })
  @IsOptional() // Validador lo hace opcional
  @IsString({ message: v.isString('id_num') })
  id_num?: string;

  @ApiProperty({ description: 'Contribuyente' })
  @IsString({ message: v.isString('contribuyente') })
  contribuyente: string;

  @ApiProperty({ description: 'tipoContribuyente' })
  @IsString({ message: v.isString('tipoContribuyente') })
  tipoContribuyente?: string;

  @ApiProperty({ description: 'segmento' })
  @IsString({ message: v.isString('segmento') })
  segmento: string;

  @ApiProperty({ description: 'perfil' })
  @IsString({ message: v.isString('perfil') })
  perfil: string;

  @ApiProperty({ description: 'Código' })
  @IsString({ message: v.isString('codigo') })
  codigo: string;

  @ApiProperty({ description: 'Deuda total' })
  @IsNumber({}, { message: v.isNumber('deuda') })
  deuda: number;

  @ApiProperty({ description: 'Id del sectorista' })
  @IsNumber({}, { message: v.isNumber('idUser') })
  idUser: number;

  @ApiPropertyOptional({
    description: 'Correo del contribuyente',
  })
  @IsOptional()
  @IsEmail({}, { message: v.isEmail('email') })
  email?: string;

  @ApiProperty({ description: 'Fecha de deuda' })
  @IsDate({ message: v.isDate('fecha') })
  fecha: Date;

  @ApiPropertyOptional({ description: 'Teléfono 1' })
  @IsOptional()
  @IsString({ message: v.isString('telefono1') })
  telefono1?: string;

  @ApiPropertyOptional({ description: 'Teléfono 2' })
  @IsOptional()
  @IsString({ message: v.isString('telefono2') })
  telefono2?: string;

  @ApiPropertyOptional({ description: 'Teléfono 3' })
  @IsOptional()
  @IsString({ message: v.isString('telefono3') })
  telefono3?: string;

  @ApiPropertyOptional({ description: 'Teléfono 4' })
  @IsOptional()
  @IsString({ message: v.isString('telefono4') })
  telefono4?: string;

  @ApiPropertyOptional({ description: 'Whatsapp' })
  @IsOptional()
  @IsString({ message: v.isString('whatsapp') })
  whatsapp?: string;

  @ApiPropertyOptional({ description: 'estadoCaso' })
  @IsOptional()
  @IsString({ message: v.isString('estadoCaso') })
  estadoCaso?: string;
}
