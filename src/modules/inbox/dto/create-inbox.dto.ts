import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { Inbox } from '../entities/inbox.entity';
import { CreateInboxCredentialDto } from './create-inbox-credential.dto';

export class CreateInboxDto extends CreateInboxCredentialDto {
  @ApiProperty({ description: 'Nombre la bandeja de entrada' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @IsUnique(Inbox, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Url del avatar de la bandeja de entrada',
  })
  @IsOptional()
  @IsString({ message: v.isString('avatarUrl') })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Color de la bandeja de entrada',
  })
  @IsOptional()
  @IsString({ message: v.isString('widgetColor') })
  widgetColor?: string;

  @ApiProperty({ description: 'Id del canal' })
  @IsNumber({}, { message: v.isNumber('channelId') })
  channelId: number;

  @ApiPropertyOptional({
    description: 'Número de teléfono de la bandeja de entrada',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
