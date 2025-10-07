import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyScreenDTO {
  @ApiProperty({ description: 'Url de la página' })
  @IsString({ message: v.isString('url') })
  @IsNotEmpty({ message: v.isNotEmpty('url') })
  url: string;
}
