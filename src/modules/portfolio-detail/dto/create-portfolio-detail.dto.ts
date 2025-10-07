import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { CitizenContactDto } from './citizen-contact.dto';
import { Type } from 'class-transformer';

export class CreatePortfolioDetailDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;

  @ApiProperty({ description: 'Segmento del contribuyente (ciudadano)' })
  @IsString({ message: v.isString('segment') })
  segment: string;

  @ApiProperty({ description: 'Perfil del contribuyente (ciudadano)' })
  @IsString({ message: v.isString('profile') })
  profile: string;

  @ApiProperty({ description: 'Nombre del contribuyente' })
  @IsString({ message: v.isString('taxpayerName') })
  taxpayerName: string;

  @ApiProperty({ description: 'Tipo de contribuyente' })
  @IsString({ message: v.isString('taxpayerType') })
  taxpayerType: string;

  @ApiProperty({
    description: 'Tipo de documento de identificación del ciudadano',
  })
  @IsString({ message: v.isString('tipDoc') })
  tipDoc: string;

  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiProperty({ description: 'Código de contribuyente (ciudadano)' })
  @IsString({ message: v.isString('code') })
  code: string;

  @ApiProperty({ description: 'Deuda del contribuyente (ciudadano)' })
  @IsNumber({}, { message: v.isNumber('debt') })
  debt: number;

  @ApiPropertyOptional({
    description: 'Pago de la deuda del contribuyente (ciudadano)',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('pay') })
  pay?: number;

  @ApiProperty({ description: 'Id del sectorista' })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @ApiPropertyOptional({ description: 'Id del sectorista' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('userId') })
  portfolioId?: number;

  @ApiPropertyOptional({ description: 'statusCase' })
  @IsOptional()
  @IsString({ message: v.isString('statusCase') })
  statusCase?: string;

  @IsArray()
  @ValidateNested({ each: true }) // Validar cada objeto del array
  @Type(() => CitizenContactDto) // Transformar cada objeto a DetallePortfolioDTO
  citizenContacts: CitizenContactDto[];
}
