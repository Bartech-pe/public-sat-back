import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CitizenContactDto } from '@modules/citizen/dto/citizen-contact.dto';

export class CreateChannelAssistanceDto {
  @ApiProperty({
    description: 'Identificador del canal',
  })
  @IsNumber({}, { message: v.isNumber('categoryId') })
  @IsNotEmpty({ message: v.isNotEmpty('categoryId') })
  categoryId: number;

  @ApiProperty({
    description: 'Id del tipo de consulta',
  })
  @IsString({ message: v.isString('consultTypeCode') })
  @IsNotEmpty({ message: v.isNotEmpty('consultTypeCode') })
  consultTypeCode: string;

  @ApiProperty({
    description: 'Tipo de documento de identificación del ciudadano',
  })
  @IsString({ message: v.isString('tipDoc') })
  tipDoc: string;

  @ApiProperty({ description: 'Documento de identificación del ciudadano' })
  @IsString({ message: v.isString('docIde') })
  docIde: string;

  @ApiProperty({ description: 'Nombre del ciudadano' })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({ description: 'Observación de atención' })
  @IsString({ message: v.isString('detail') })
  detail: string;

  @ApiProperty({
    description: 'Identificador de la comunicación',
  })
  @IsNumber({}, { message: v.isNumber('communicationId') })
  @IsNotEmpty({ message: v.isNotEmpty('communicationId') })
  communicationId: number;

  @IsOptional()
  @Type(() => CitizenContactDto)
  contact: CitizenContactDto;
}
