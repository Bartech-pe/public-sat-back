import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ContactType {
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
}

export class CitizenContactDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;

  @ApiProperty({
    description: 'Tipo de documento de identificación del ciudadano',
  })
  @IsString({ message: v.isString('tipDoc') })
  tipDoc: string;

  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiProperty({ description: 'Tipo del contacto' })
  @IsEnum(ContactType, { message: v.isEnum('contactType') })
  contactType: ContactType;

  @ApiProperty({ description: 'Valor del contacto' })
  @IsString({ message: v.isString('value') })
  value: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('isAdditional') })
  @Transform(({ value }) => value === 'true' || value === true)
  isAdditional?: boolean;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
