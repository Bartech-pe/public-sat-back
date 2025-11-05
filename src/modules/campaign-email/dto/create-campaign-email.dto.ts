import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { EmailAttachmentDto } from './create-attachmen-email.dto';

export class CreateCampaignEmailDto {

  @ApiProperty({ description: 'Código del proceso', example: 101 })
  @IsInt({ message: 'El código del proceso debe ser un número entero' })
  processCode: number;

  @ApiProperty({ description: 'Código del remitente', example: 5 })
  @IsInt({ message: 'El código del remitente debe ser un número entero' })
  senderCode: number;

  @ApiProperty({ description: 'id campaña configuracion', example: 5 })
  @IsInt({ message: 'El campaña configuracion debe ser un número entero' })
  idCampaignEmailConfig?: number;

  @ApiProperty({ description: 'Correo destino', example: 'cliente@empresa.com' })
  @IsEmail({}, { message: 'El correo destino no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo destino es obligatorio' })
  to: string;

  @ApiProperty({ description: 'Correo con copia (CC)', required: false, example: 'copia@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo con copia no tiene un formato válido' })
  cc?: string;

  @ApiProperty({ description: 'Correo con copia oculta (BCC)', required: false, example: 'copia-oculta@empresa.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo con copia oculta no tiene un formato válido' })
  bcc?: string | null;

  @ApiProperty({ description: 'Asunto del correo', example: 'Bienvenido a nuestra plataforma' })
  @IsString({ message: 'El asunto debe ser un texto' })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  subject: string;

  @ApiProperty({ description: 'Mensaje del correo en HTML', example: '<p>Hola, gracias por registrarte</p>' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  message: string;

  @ApiProperty({ description: 'Código del tipo de documento', required: false, example: 12 })
  @IsOptional()
  @IsInt({ message: 'El código del tipo de documento debe ser un número entero' })
  documentTypeCode?: number | null;

  @ApiProperty({ description: 'Valor del tipo de documento', required: false, example: 'Factura' })
  @IsOptional()
  @IsString({ message: 'El valor del tipo de documento debe ser un texto' })
  documentTypeValue?: string | null;

  @ApiProperty({ description: 'Nombre del terminal', example: 'TERMINAL-01' })
  @IsString({ message: 'El nombre del terminal debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del terminal es obligatorio' })
  terminalName: string;

  @ApiProperty({ description: 'Archivos adjuntos', type: [EmailAttachmentDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Los adjuntos deben estar en un arreglo' })
  attachments?: [];
}
