import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateSkillUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @IsNumber({}, { message: v.isNumber('skillId') })
  skillId: number;

  @IsNumber({}, { message: v.isNumber('score') })
  score: number;
}
