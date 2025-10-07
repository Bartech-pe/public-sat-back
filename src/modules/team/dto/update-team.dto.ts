import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
