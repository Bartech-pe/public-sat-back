import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelScheduleDto {
  @ApiProperty({ description: 'mes', example: '2025-09-01T05:00:00.000Z' })
  @IsNotEmpty()
  month: Date;

  @ApiProperty({ description: 'id canal', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsArray()
  @ValidateNested({ each: true }) // Validar cada objeto del array
  days: string[];
}
