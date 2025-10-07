import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
