import { IsBoolean, IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateRoleScreenOfficeDto {
  @IsNumber({}, { message: v.isNumber('roleId') })
  roleId: number;

  @IsNumber({}, { message: v.isNumber('screenId') })
  screenId: number;

  @IsNumber({}, { message: v.isNumber('officeId') })
  officeId: number;

  @IsBoolean({ message: v.isBoolean('canRead') })
  canRead: boolean;

  @IsBoolean({ message: v.isBoolean('canCreate') })
  canCreate: boolean;

  @IsBoolean({ message: v.isBoolean('canUpdate') })
  canUpdate: boolean;

  @IsBoolean({ message: v.isBoolean('canDelete') })
  canDelete: boolean;
}
