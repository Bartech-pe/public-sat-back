import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Team } from '../entities/team.entity';

export class CreateTeamDto {
  @ApiProperty({ description: 'Nombre del equipo' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Team, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Encargado de asesorar',
    description: 'Descripción del equipo',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
