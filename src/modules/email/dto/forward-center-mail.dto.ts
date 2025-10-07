import { IsNumber, IsString } from 'class-validator';

export class ForwardCenterMail {
  @IsNumber()
  mailAttentionId: number;

  @IsString()
  from: string;

  @IsString()
  message: string;
}
