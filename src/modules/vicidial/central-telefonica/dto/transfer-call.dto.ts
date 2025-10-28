import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class TransferCallDto {
  @IsNotEmpty({ message: v.isNotEmpty('userId') })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;
}

export class TransferSurveyDto {
  @IsNotEmpty({ message: v.isNotEmpty('dial') })
  @IsString({ message: v.isString('dial') })
  dial: string;
}
