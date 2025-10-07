import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Role } from '../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({ example: 'Asesor', description: 'Nombre del rol' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Role, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Encargado de asesorar',
    description: 'Descripción del rol',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
