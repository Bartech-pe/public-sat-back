import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateCitizenBasicInformationDto {
  @ApiProperty({ description: 'Número de teléfono' })
  @IsNotEmpty({ message: v.isNotEmpty('phoneNumber') })
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber: string;

  @ApiProperty({ description: 'Nombres completos del ciudadano' })
  @IsNotEmpty({ message: v.isNotEmpty('fullName') })
  @IsString({ message: v.isString('fullName') })
  fullName: string;

  @ApiProperty({ description: 'Tipo de documento' })
  @IsNotEmpty({ message: v.isNotEmpty('documentType') })
  @IsString({ message: v.isString('documentType') })
  documentType: string;

  @ApiProperty({ description: 'Numero de documento' })
  @IsNotEmpty({ message: v.isNotEmpty('documentNumber') })
  @IsString({ message: v.isString('documentNumber') })
  documentNumber: string;
}
