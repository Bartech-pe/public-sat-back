import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateTeamUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('idTeam') })
  idTeam: number;

  @IsNumber({}, { message: v.isNumber('idUser') })
  idUser: number;
}
