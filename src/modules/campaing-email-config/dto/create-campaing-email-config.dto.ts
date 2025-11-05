import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
export class CreateCampaingEmailConfigDto {

  @ApiProperty({ description: 'nombre campaña', example: 'campaña nueva' })
  @IsNotEmpty({ message: 'El nombre campaña es obligatorio' })
  name: string;
  
  @ApiProperty({ description: 'total registrado', example: 5 })
  @IsInt({ message: 'total registrado debe ser un número entero' })
  totalRegistration: number;

  @ApiProperty({ description: 'estado de campaña registrado', example: 5 })
  @IsInt({ message: 'estado de campaña debe ser un número entero' })
  campaignStatus: number;

  @ApiProperty({ description: 'plantilla correo', example: 5 })
  @IsInt({ message: 'plantilla correo debe ser un número entero' })
  idTemplate: number;

}
