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
import { Channel } from '../entities/channel.entity';

export class CreateChannelDto {
  @ApiProperty({ example: 'Whatsapp', description: 'Nombre del canal' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(Channel, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Aplicación de mensajería',
    description: 'Descripción del canal',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({
    example: 'logos:whatsapp-icon',
    description:
      'Icono del canal https://icon-sets.iconify.design/logos/?keyword=logo',
  })
  @IsString({ message: v.isString('logo') })
  logo: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
