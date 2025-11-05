import { IsString } from 'class-validator';

export class ReplyEmail {
  @IsString()
  clientId: string;
  
  @IsString()
  email: string;

  @IsString()
  messageId: string;

  @IsString()
  content: string;

  @IsString()
  threadId: string;
}
