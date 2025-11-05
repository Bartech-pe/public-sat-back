import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Type } from 'class-transformer';

export class ReasignCarteraDetalleDto {
  @IsNumber({}, { message: v.isNumber('id') })
  @IsNotEmpty({ message: v.isNotEmpty('id') })
  id: number;

  @ApiProperty({ description: 'Id del sectorista' })
  @IsNumber({}, { message: v.isNumber('idUser') })
  @IsNotEmpty({ message: v.isNotEmpty('idUser') })
  idUser: number;
}

export class ReasignCarteraDetalleListDto {
  @IsArray()
  @IsNotEmpty({ message: v.isNotEmpty('dtoList') })
  @ValidateNested({ each: true }) // Validar cada objeto del array
  @Type(() => ReasignCarteraDetalleDto) // Transformar cada objeto a DetalleCarteraDTO
  dtoList: ReasignCarteraDetalleDto[];
}
