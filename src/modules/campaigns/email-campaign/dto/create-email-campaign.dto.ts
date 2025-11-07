import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEmailCampaignDto {
  @ApiProperty({ description: 'nombre campaña' })
  @IsNotEmpty({ message: 'El nombre campaña es obligatorio' })
  name: string;

  @ApiProperty({ description: 'total registrado' })
  @IsInt({ message: 'total registrado debe ser un número entero' })
  totalRegistered: number;

  @ApiProperty({ description: 'estado de campaña registrado' })
  @IsInt({ message: 'estado de campaña debe ser un número entero' })
  campaignStatus: number;

  @ApiProperty({ description: 'plantilla correo' })
  @IsInt({ message: 'plantilla correo debe ser un número entero' })
  templateId: number;
}
