import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVicidialCredentialDto {
  @ApiProperty({
    description: 'Nombre del inbox',
    example: 'SAT - EXAMPLE',
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'ID del inbox existente (si se envía, se realiza update en lugar de create)',
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  inboxId?: number;

  @ApiProperty({
    description: 'Host o URL del servidor Vicidial',
    example: 'https://vicidial.miempresa.com',
  })
  @IsString()
  @IsNotEmpty()
  vicidialHost: string;

  @ApiProperty({
    description: 'Dirección IP pública del servidor Vicidial',
    example: '203.0.113.45',
  })
  @IsString()
  @IsNotEmpty()
  publicIp: string;

  @ApiProperty({
    description: 'Dirección IP privada del servidor Vicidial',
    example: '192.168.1.10',
  })
  @IsString()
  @IsNotEmpty()
  privateIp: string;

  @ApiProperty({
    description: 'Usuario del API de Vicidial',
    example: 'vicidial_user',
  })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({
    description: 'Contraseña del API de Vicidial',
    example: 'superSecret123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
