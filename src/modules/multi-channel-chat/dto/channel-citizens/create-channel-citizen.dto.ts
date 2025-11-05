import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';
import { CitizenDocType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

export class CreateChannelCitizenDto {
  @ApiProperty({ description: 'Nombre la bandeja de entrada' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @IsOptional()
  @IsString({ message: v.isString('externalUserId') })
  externalUserId?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: v.isString('documentNumber') })
  documentNumber?: string;

  @IsOptional()
  @IsString({ message: v.isString('documentType') })
  documentType?: CitizenDocType;

  @ApiProperty({ description: 'Indica si viene de el chat Externo' })
  @IsNotEmpty({ message: v.isNotEmpty('isExternal') })
  @IsBoolean({ message: v.isBoolean('isExternal') })
  isExternal: boolean;

  @IsOptional()
  @IsString({ message: v.isString('email') })
  email?: string;

  @IsOptional()
  @IsString({ message: v.isString('avatarUrl') })
  avatarUrl?: string;
}
