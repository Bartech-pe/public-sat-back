import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';

export class ManualDialDto {
  @IsNotEmpty({ message: v.isNotEmpty('phoneNumber') })
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber: string;

  @IsNotEmpty({ message: v.isNotEmpty('phoneCode') })
  @IsString({ message: v.isString('phoneCode') })
  phoneCode: string;
}
