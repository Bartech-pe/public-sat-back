import { IsNotEmpty, IsString } from 'class-validator';

export class CampaingByAgentDto {
  @IsString()
  @IsNotEmpty()
  agentUser: string;
}
