import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
