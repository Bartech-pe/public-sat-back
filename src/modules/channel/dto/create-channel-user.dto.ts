import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateChannelUserDto {
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @IsNumber({}, { message: v.isNumber('idChannel') })
  idChannel: number;

  @IsNumber({}, { message: v.isNumber('idUser') })
  idUser: number;
}
