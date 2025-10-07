import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CallFilter {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Type(() => Number)
  offset: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stateId?: number;

  @ApiProperty({ required: false, example: 'papeleta' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: '0' })
  @IsOptional()
  @IsString()
  advisor?: string;

  @ApiProperty({ required: false, example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ required: false, example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
