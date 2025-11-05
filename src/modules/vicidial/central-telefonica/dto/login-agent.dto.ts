import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginAgentDto {
  @ApiProperty({ description: 'Id de campaña' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({ description: 'InboundGroups' })
  @IsString()
  @IsNotEmpty()
  inboundGroups: string;
}

export class CampaignSearchDto {
  @IsOptional()
  @ApiProperty({ description: 'Id de campaña' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;
}
