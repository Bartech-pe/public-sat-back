import { IsOptional, IsString, IsNumber, IsBoolean, IsDate  } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateAsignarCarteraDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  id_cartera_detalle: number;


  @IsNumber()
  id_cartera: number;

  @IsNumber()
  id_user: number;

  @IsNumber()
  id_num: number;

  @IsString()
  sectorista?: string;

  @IsString()
  segmento: string;

  @IsString()
  perfil: string;

  @IsString()
  contribuyente: string;

  @IsString()
  codigo: string;

  @IsOptional()
  @IsNumber()
  deuda?: number;

  @IsOptional()
  @IsNumber()
  pago?: number;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  fecha: Date;

  @IsOptional()
  @IsString()
  telefono1?: string;

  @IsOptional()
  @IsString()
  telefono2?: string;

  @IsOptional()
  @IsString()
  telefono3?: string;

  @IsOptional()
  @IsString()
  telefono4?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
