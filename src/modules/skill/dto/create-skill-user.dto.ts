import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateSkillUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('idUser') })
  idUser: number;

  @IsNumber({}, { message: v.isNumber('idSkill') })
  idSkill: number;

  @IsNumber({}, { message: v.isNumber('score') })
  score: number;
}
