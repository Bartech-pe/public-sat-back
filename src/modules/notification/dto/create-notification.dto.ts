import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario que recibe la notificación' })
  @IsNotEmpty({ message: v.isNotEmpty('userId') })
  @IsNumber({}, { message: v.isNumber('userId') })
  userId: number;

  @ApiProperty({ description: 'Mensaje de la notificación' })
  @IsNotEmpty({ message: v.isNotEmpty('message') })
  @IsString({ message: v.isString('message') })
  message: string;
}
