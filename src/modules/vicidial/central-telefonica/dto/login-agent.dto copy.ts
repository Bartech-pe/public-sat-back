import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAgentDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  inboundGroups: string;
}
