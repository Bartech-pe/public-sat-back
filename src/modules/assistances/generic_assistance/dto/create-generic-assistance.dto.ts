import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CitizenContactDto } from '@modules/citizen/dto/citizen-contact.dto';

export class CreateGenericAssistanceDto {
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

  @IsOptional()
  @Type(() => CitizenContactDto)
  contact: CitizenContactDto;
}
