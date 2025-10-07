import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCitizenAssistanceDto {
  @ApiProperty({ description: 'Metodo de atención' })
  @ValidateIf(o => !o.verifyPayment) // Solo valida si verifyPayment es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('method') })
  @IsString({ message: v.isString('method') })
  method: string;

  @ApiProperty({ description: 'Tipo contact de atención' })
  @ValidateIf(o => !o.verifyPayment) // Solo valida si verifyPayment es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('type') })
  @IsString({ message: v.isString('type') })
  type: string;

  @ApiProperty({ description: 'Canal de atención' })
  @ValidateIf(o => !o.verifyPayment) // Solo valida si verifyPayment es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('channel') })
  @IsString({ message: v.isString('channel') })
  channel: string;

  @ApiProperty({ description: 'Contacto de atención' })
  @ValidateIf(o => !o.verifyPayment) // Solo valida si verifyPayment es false o undefined
  @IsNotEmpty({ message: v.isNotEmpty('contact') })
  @IsString({ message: v.isString('contact') })
  contact: string;

  @ApiProperty({ description: 'Resultado de atención' })
  @IsNotEmpty({ message: v.isNotEmpty('result') })
  @IsString({ message: v.isString('result') })
  result: string;

  @ApiPropertyOptional({ description: 'Observación de atención' })
  @IsOptional()
  @IsString({ message: v.isString('observation') })
  observation: string;

  @ApiProperty({ description: 'Tipo de documento de identificación del ciudadano' })
  @IsOptional()
  @IsString({ message: v.isString('tipDoc') })
  tipDoc: string;
  
  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsOptional()
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiPropertyOptional({ description: 'Campo para marcar si es una verificación de pago' })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('verifyPayment') })
  @Transform(({ value }) => value === 'verifyPayment' || value === true)
  verifyPayment?: boolean;

  @ApiProperty({ description: 'Id cartera detalle de la atención' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('portfolioDetailId') })
  portfolioDetailId: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
