import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateAtencionCiudadanoDto {
  @ApiProperty({ description: 'Metodo de atención' })
  @ValidateIf(o => !o.verifPago) // Solo valida si verifPago es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('metodo') })
  @IsString({ message: v.isString('metodo') })
  metodo: string;

  @ApiProperty({ description: 'Tipo contacto de atención' })
  @ValidateIf(o => !o.verifPago) // Solo valida si verifPago es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('tipo') })
  @IsString({ message: v.isString('tipo') })
  tipo: string;

  @ApiProperty({ description: 'Canal de atención' })
  @ValidateIf(o => !o.verifPago) // Solo valida si verifPago es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('canal') })
  @IsString({ message: v.isString('canal') })
  canal: string;

  @ApiProperty({ description: 'Contacto de atención' })
  @ValidateIf(o => !o.verifPago) // Solo valida si verifPago es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('contacto') })
  @IsString({ message: v.isString('contacto') })
  contacto: string;

  @ApiProperty({ description: 'Resultado de atención' })
  @IsNotEmpty({ message: v.isNotEmpty('resultado') })
  @IsString({ message: v.isString('resultado') })
  resultado: string;

  @ApiPropertyOptional({ description: 'Observación de atención' })
  @IsOptional()
  @IsString({ message: v.isString('observacion') })
  observacion: string;

  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsOptional()
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiPropertyOptional({ description: 'Campo para marcar si es una verificación de pago' })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('verifPago') })
  @Transform(({ value }) => value === 'verifPago' || value === true)
  verifPago?: boolean;

  @ApiProperty({ description: 'Id cartera detalle de la atención' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('idCarteraDetalle') })
  idCarteraDetalle: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
