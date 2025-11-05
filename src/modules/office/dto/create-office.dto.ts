import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Office } from '../entities/office.entity';

export class CreateOfficeDto {
  @ApiProperty({ description: 'Nombre del oficina' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @IsUnique(Office, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del oficina',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({ description: 'id del área asignado' })
  @IsNumber({}, { message: v.isNumber('departmentId') })
  departmentId: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
