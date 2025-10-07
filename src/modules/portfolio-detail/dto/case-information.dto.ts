import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CaseInformationDto {
  @ApiPropertyOptional({ description: 'Observación de atención' })
  @IsOptional()
  @IsNotEmpty({ message: v.isNotEmpty('observacion') })
  @IsString({ message: v.isString('observacion') })
  observacion?: string;

  @ApiPropertyOptional({
    description: 'Compromiso de pago',
  })
  @IsOptional()
  @IsString({ message: v.isString('compromisoPago') })
  compromisoPago?: string;

  @ApiPropertyOptional({
    description: 'Seguimiento',
  })
  @IsOptional()
  @IsString({ message: v.isString('seguimiento') })
  seguimiento?: string;

  @ApiPropertyOptional({ description: 'Id cartera detalle' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('idPortfolioDetail') })
  idPortfolioDetail?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
