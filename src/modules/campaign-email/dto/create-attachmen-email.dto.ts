import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class EmailAttachmentDto {
  @ApiProperty({ description: 'Nombre del archivo adjunto', example: 'documento.pdf' })
  @IsString({ message: 'El nombre del archivo debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del archivo es obligatorio' })
  fileName?: string;

  @ApiProperty({ description: 'Código del tipo de archivo', example: 8 })
  @IsInt({ message: 'El código del tipo de archivo debe ser un número entero' })
  fileTypeCode?: number;

  @ApiProperty({ description: 'Orden del adjunto en el correo', example: 1 })
  @IsInt({ message: 'El orden debe ser un número entero' })
  order?: number;

  @ApiProperty({ description: 'Contenido en base64 del archivo', example: 'JVBERi0xLjQKJ...' })
  @IsString({ message: 'El contenido en Base64 debe ser un texto' })
  @IsNotEmpty({ message: 'El contenido en Base64 es obligatorio' })
  base64?: string;
}

