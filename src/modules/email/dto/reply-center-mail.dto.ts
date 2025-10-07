import { IsNumber, IsString } from 'class-validator';

export class ReplyCenterMail {
  @IsNumber()
  mailAttentionId: number;

  @IsString()
  content: string;
}
