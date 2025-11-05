import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';

export class DispoChoiceDto {
  @IsNotEmpty({ message: v.isNotEmpty('dispoChoice') })
  @IsString({ message: v.isString('dispoChoice') })
  dispoChoice: string;

  @IsNotEmpty({ message: v.isNotEmpty('pauseAgent') })
  @Transform(({ value }) => value === 'true' || value === true)
  pauseAgent: boolean;
}
