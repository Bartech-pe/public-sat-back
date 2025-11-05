import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateReminderDto {
  @ApiProperty({
    example: 'recordatorio',
    description: 'Nombre de recordatorio',
  })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'descripción',
    description: 'descripción del recordatorio',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({ description: 'Fecha del recordatorio' })
  @IsNotEmpty({ message: v.isNotEmpty('reminderAt') })
  @IsDate({ message: v.isDate('reminderAt') })
  reminderAt: Date;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
