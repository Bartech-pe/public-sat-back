import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCampaignScheduleDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Intervalo de días en formato 0-6',
  })
  @IsString({ message: v.isString('intervalDays') })
  intervalDays: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Hora de inicio HH:mm',
  })
  @IsString({ message: v.isString('startTime') })
  startTime: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Hora de fin HH:mm',
  })
  @IsString({ message: v.isString('endTime') })
  endTime: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
