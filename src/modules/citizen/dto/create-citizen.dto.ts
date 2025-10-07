import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCitizenDto {
  @ApiProperty({
    description: 'Tipo de documento de identificación del ciudadano',
  })
  @IsOptional()
  @IsString({ message: v.isString('tipDoc') })
  tipDoc: string;

  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsOptional()
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiProperty({ example: 'Whatsapp', description: 'Nombre del canal' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;
}
