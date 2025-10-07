import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatRoomMultipleDto {
  @ApiPropertyOptional({
    description: 'Alias del chat',
  })
  @IsOptional()
  @IsString({ message: v.isString('name') })
  name?: string;

  @ApiProperty({ description: 'ids de los usuarios a incluir en el room' })
  @IsArray({
    always: true,
  })
  @IsNotEmpty()
  userIds: number[];

  @ApiPropertyOptional({ description: 'Indica si es un grupo', default: true })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;
}
