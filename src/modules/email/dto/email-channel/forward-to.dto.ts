import { IsString } from 'class-validator';

export class ForwardTo {
  @IsString()
  messageId: string;

  @IsString()
  forwardTo: string;

  @IsString()
  message: string;
}
