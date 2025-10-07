import { IsString } from 'class-validator';

export class ReplyEmail {
  @IsString()
  messageId: string;

  @IsString()
  content: string;

  @IsString()
  threadId: string;
}
