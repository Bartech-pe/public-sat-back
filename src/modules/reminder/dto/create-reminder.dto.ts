
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Reminder } from '../entities/reminder.entity';
export class CreateReminderDto {
  
  @ApiProperty({ example: 'recordatorio', description: 'Nombre de recordatorio' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Reminder, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'descripción',
    description: 'descripción del recordatorio',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiPropertyOptional({
    example: 'Fecha',
    description: 'Fecha del recordatorio',
  })
  @IsOptional()
  @IsString({ message: v.isString('date') })
  date: string;


  @ApiPropertyOptional({
    example: 'Hora',
    description: 'Hora del recordatorio',
  })
  @IsOptional()
  @IsString({ message: v.isString('hour') })
  hour: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

}
