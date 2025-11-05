import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Department } from '../entities/department.entity';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Nombre del área' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @IsUnique(Department, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del área',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
