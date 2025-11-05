import { IsString } from 'class-validator';

export class ForwardTo {
  @IsString()
  clientId: string;

  @IsString()
  email: string;

  @IsString()
  messageId: string;

  @IsString()
  forwardTo: string;

  @IsString()
  message: string;
}
