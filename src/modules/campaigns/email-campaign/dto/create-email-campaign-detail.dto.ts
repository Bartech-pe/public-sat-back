import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { EmailCampaignAttachmentDto } from './email-campaign-attachment.dto';

export class CreateEmailCampaignDetailDto {
  @ApiProperty({ description: 'Código del proceso' })
  @IsInt({ message: 'El código del proceso debe ser un número entero' })
  processCode: number;

  @ApiProperty({ description: 'Código del remitente' })
  @IsInt({ message: 'El código del remitente debe ser un número entero' })
  senderCode: number;

  @ApiProperty({ description: 'id campaña configuracion' })
  @IsInt({ message: 'El campaña configuracion debe ser un número entero' })
  emailCampaignId?: number;

  @ApiProperty({ description: 'Correo destino' })
  @IsEmail({}, { message: 'El correo destino no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo destino es obligatorio' })
  to: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Correo con copia (CC)' })
  @IsEmail({}, { message: 'El correo con copia no tiene un formato válido' })
  cc?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Correo con copia oculta (BCC)' })
  @IsEmail(
    {},
    { message: 'El correo con copia oculta no tiene un formato válido' },
  )
  bcc?: string;

  @ApiProperty({ description: 'Asunto del correo' })
  @IsString({ message: 'El asunto debe ser un texto' })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  subject: string;

  @ApiProperty({ description: 'Mensaje del correo en HTML' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  message: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Código del tipo de documento' })
  @IsInt({
    message: 'El código del tipo de documento debe ser un número entero',
  })
  documentTypeCode?: number;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Valor del tipo de documento' })
  @IsString({ message: 'El valor del tipo de documento debe ser un texto' })
  documentTypeValue?: string;

  @ApiProperty({ description: 'Nombre del terminal' })
  @IsString({ message: 'El nombre del terminal debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del terminal es obligatorio' })
  terminalName: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Validar cada objeto del array
  @Type(() => EmailCampaignAttachmentDto) // Transformar cada objeto a EmailCampaignAttachmentDto
  attachments: EmailCampaignAttachmentDto[];
}
