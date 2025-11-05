import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { UserVicidialDto } from './user-vicidial.dto';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre a mostrar en las conversaciones',
  })
  @IsOptional()
  @IsString({ message: v.isString('displayName') })
  displayName?: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsNotEmpty({ message: v.isNotEmpty('email') })
  @IsEmail({}, { message: v.isEmail('email') })
  @IsUnique(User, 'email', { message: v.isUnique('email') })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: v.isString('password') })
  @MinLength(6, { message: v.minLength('password', 6) })
  password: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL de la imagen de perfil del usuario',
  })
  @IsOptional()
  @IsString({ message: v.isString('avatarUrl') })
  avatarUrl?: string;

  @ApiProperty({ description: 'id del rol asignado' })
  @IsNumber({}, { message: v.isNumber('idRole') })
  idRole: number;

  @ApiPropertyOptional({ description: 'id de la oficina asignado' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('idOficina') })
  idOficina: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserVicidialDto)
  vicidial?: UserVicidialDto;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
