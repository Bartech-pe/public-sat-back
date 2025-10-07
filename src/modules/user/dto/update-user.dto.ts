import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
