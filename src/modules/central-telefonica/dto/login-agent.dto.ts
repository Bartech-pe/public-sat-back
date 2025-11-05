import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAgentDto {
  @IsString()
  @IsNotEmpty()
  idCampaign: string;
}
