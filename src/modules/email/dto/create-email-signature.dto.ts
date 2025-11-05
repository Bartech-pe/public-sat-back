import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailSignatureDto {
  @ApiProperty({ description: 'Id del usuario' })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @ApiProperty({ description: 'Contenido de la firma' })
  @IsNotEmpty({ message: v.isNotEmpty('content') })
  @IsString({ message: v.isString('content') })
  content: string;
}
