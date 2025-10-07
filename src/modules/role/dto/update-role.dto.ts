import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
