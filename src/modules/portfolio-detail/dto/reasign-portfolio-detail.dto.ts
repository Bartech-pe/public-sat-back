import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Type } from 'class-transformer';

export class ReasignPortfolioDetailDto {
  @IsNumber({}, { message: v.isNumber('id') })
  @IsNotEmpty({ message: v.isNotEmpty('id') })
  id: number;

  @ApiProperty({ description: 'Id del sectorista' })
  @IsNumber({}, { message: v.isNumber('userId') })
  @IsNotEmpty({ message: v.isNotEmpty('userId') })
  userId: number;
}

export class ReasignPortfolioDetailListDto {
  @IsArray()
  @IsNotEmpty({ message: v.isNotEmpty('dtoList') })
  @ValidateNested({ each: true }) // Validar cada objeto del array
  @Type(() => ReasignPortfolioDetailDto) // Transformar cada objeto a DetalleCarteraDTO
  dtoList: ReasignPortfolioDetailDto[];
}
