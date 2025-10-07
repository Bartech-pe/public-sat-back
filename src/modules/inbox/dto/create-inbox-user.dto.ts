import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
export class CreateInboxUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('inboxId') })
  inboxId: number;

  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @IsOptional()
  @IsString({ message: v.isString('accessToken') })
  accessToken?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumberId') })
  phoneNumberId?: string;

  @IsOptional()
  @IsString({ message: v.isString('businessId') })
  businessId?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber?: string;
}
