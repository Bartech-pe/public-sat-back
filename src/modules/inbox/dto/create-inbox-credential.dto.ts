import {
  IsBoolean,
  IsDate,
  isDate,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';

export class CreateInboxCredentialDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('inboxId') })
  inboxId?: number;

  @IsOptional()
  @IsString({ message: v.isString('businessId') })
  businessId?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumberId') })
  phoneNumberId?: string;

  @IsOptional()
  @IsString({ message: v.isString('accessToken') })
  accessToken?: string;

  @IsOptional()
  @IsDate({ message: 'expiresAt debe ser una fecha válida' })
  expiresAt?: Date;
}
