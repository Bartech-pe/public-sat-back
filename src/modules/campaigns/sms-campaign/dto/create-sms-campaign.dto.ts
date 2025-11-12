
import {
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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

  @IsString()
  sender: string;

  @IsString()
  message: string;

  // @ApiProperty({
  //     type: 'string',
  //     format: 'binary',
  //     description: 'Archivo Excel con los detalles de la cartera',
  // })
  // file: Express.Multer.File; 
}
