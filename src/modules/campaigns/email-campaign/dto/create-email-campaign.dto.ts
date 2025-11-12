import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
class AttachmentDto {
  @ApiProperty({ description: 'Nombre del archivo', example: 'documento.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'Tipo de archivo (por ejemplo: PDF, IMG, DOCX)', example: 'PDF' })
  @IsString()
  @IsNotEmpty()
  fileTypeCode: string;

  @ApiProperty({ description: 'Orden del archivo', example: 1 })
  @IsInt()
  order: number;

  @ApiProperty({ description: 'Archivo en formato Base64', example: 'data:application/pdf;base64,JVBERi0xLjQKJ...' })
  @IsString()
  @IsNotEmpty()
  base64: string;
}
export class CreateEmailCampaignDto {
  @ApiProperty({ description: 'nombre campaña' })
  @IsNotEmpty({ message: 'El nombre campaña es obligatorio' })
  name: string;

  @ApiProperty({ description: 'Asunto correo campaña' })
  @IsNotEmpty({ message: 'El Asunto correo campaña es obligatorio' })
  subject: string;

  @ApiProperty({ description: 'Remitente correo campaña' })
  @IsNotEmpty({ message: 'El Remitente correo de campaña es obligatorio' })
  sender: string;

  @ApiProperty({ description: 'total registrado' })
  @IsInt({ message: 'total registrado debe ser un número entero' })
  totalRegistered: number;

  @ApiProperty({ description: 'estado de campaña registrado' })
  @IsInt({ message: 'estado de campaña debe ser un número entero' })
  campaignStatus: number;

  @ApiProperty({ description: 'plantilla correo' })
  @IsInt({ message: 'plantilla correo debe ser un número entero' })
  templateId: number;

  @ApiProperty({
    description: 'Lista de archivos adjuntos en formato Base64',
    type: [AttachmentDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
