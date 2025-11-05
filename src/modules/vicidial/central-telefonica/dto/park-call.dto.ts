import { IsBoolean } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';

export class ParkCallDto {
  @IsBoolean({ message: v.isBoolean('putOn') })
  @Transform(({ value }) => value === 'true' || value === true)
  putOn: boolean;
}
