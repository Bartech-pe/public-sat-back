import { IsBoolean, IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateRoleScreenDto {
  @IsNumber({}, { message: v.isNumber('idRole') })
  idRole: number;

  @IsNumber({}, { message: v.isNumber('idScreen') })
  idScreen: number;

  @IsBoolean({ message: v.isBoolean('canRead') })
  canRead: boolean;

  @IsBoolean({ message: v.isBoolean('canCreate') })
  canCreate: boolean;

  @IsBoolean({ message: v.isBoolean('canUpdate') })
  canUpdate: boolean;

  @IsBoolean({ message: v.isBoolean('canDelete') })
  canDelete: boolean;
}
