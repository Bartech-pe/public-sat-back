import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiPropertyOptional({
    description: 'Alias del chat',
  })
  @IsOptional()
  @IsString({ message: v.isString('name') })
  name?: string;

  @ApiProperty({ description: 'id del usuario para iniciar un chat' })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;
}
