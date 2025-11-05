import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultTypeDto {
  @ApiProperty({ example: 'Whatsapp', description: 'Nombre del canal' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;
}
