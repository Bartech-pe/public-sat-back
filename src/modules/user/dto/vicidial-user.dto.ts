import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { VicidialUser } from '../entities/vicidial-user.entity';

export class VicidialUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;

  @ApiProperty({ description: 'Username del agente en Vicidial' })
  @IsNotEmpty({ message: v.isNotEmpty('username') })
  @IsString({ message: v.isString('username') })
  @IsUnique(VicidialUser, 'username', {
    message: v.isUnique('Username de agente'),
  })
  username: string;

  @ApiProperty({ description: 'Password de usuario en Vicidial' })
  @IsNotEmpty({ message: v.isNotEmpty('userPass') })
  @IsString({ message: v.isString('userPass') })
  userPass: string;

  @ApiProperty({ description: 'Extensión/teléfono del agente' })
  @IsNotEmpty({ message: v.isNotEmpty('phoneLogin') })
  @IsString({ message: v.isString('phoneLogin') })
  @IsUnique(VicidialUser, 'phoneLogin', {
    message: v.isUnique('Extensión/teléfono'),
  })
  phoneLogin: string;

  @ApiProperty({ description: 'Password del teléfono SIP' })
  @IsNotEmpty({ message: v.isNotEmpty('phonePass') })
  @IsString({ message: v.isString('phonePass') })
  phonePass: string;

  @ApiProperty({ description: 'Nivel de usuario (1=agente, 9=admin)' })
  @IsNotEmpty({ message: v.isNotEmpty('userLevel') })
  @IsNumber({}, { message: v.isNumber('userLevel') })
  userLevel: number;

  @ApiProperty({ description: 'Grupo del usuario (ej: AGENTS)' })
  @IsNotEmpty({ message: v.isNotEmpty('userGroup') })
  @IsString({ message: v.isString('userGroup') })
  userGroup: string;

  @IsOptional()
  @IsString({ message: v.isString('fullname') })
  fullname: string;

  @IsOptional()
  @ApiProperty({ description: 'Id del usuario' })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;
}
