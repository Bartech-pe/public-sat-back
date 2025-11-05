import { IsOptional, IsString, IsNumber, IsBoolean, IsDate  } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class AsignarCarteraDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  idCarteraDetalle: number;

  @IsNumber()
  idUserPrev: number;
   
  @IsNumber()
  idUser: number;

  @IsOptional()
  @IsString({ message: 'motivo debe ser un texto' })
  motivo?: string;

}