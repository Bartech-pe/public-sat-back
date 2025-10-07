import { MessageParameter } from '@common/proxy/sms/dto/SMSSendDto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SMSIndividualDto {
  @ApiProperty({
    description: 'message',
    example: 'mensaje de prueba individual',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    description: 'number',
    example: '944121294',
  })
  @IsString()
  @IsNotEmpty()
  number: string;
}
export class SMSMAsivoDto {
  MessageParameters: MessageParameter[];
}
