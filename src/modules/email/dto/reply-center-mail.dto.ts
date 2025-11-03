import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReplyCenterMail {
  @IsNumber()
  mailAttentionId: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  threadId?: string;
}
