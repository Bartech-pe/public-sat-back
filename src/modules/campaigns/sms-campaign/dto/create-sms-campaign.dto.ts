import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSmsCampaignDto {
  @ApiProperty({ description: 'nombre campaña' })
  @IsNotEmpty({ message: 'El nombre campaña es obligatorio' })
  name: string;

  @ApiProperty({ description: 'total registrado' })
  @IsInt({ message: 'total registrado debe ser un número entero' })
  totalRegistered: number;

  @ApiProperty({ description: 'estado de campaña registrado' })
  @IsInt({ message: 'estado de campaña debe ser un número entero' })
  campaignStatus: number;
}
