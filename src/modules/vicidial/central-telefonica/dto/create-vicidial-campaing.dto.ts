import { IsString, IsOptional, Length } from 'class-validator';

export class CreateVicidialCampaignDto {
  
  @IsString()
  @Length(1, 50)
  campaign_id: number;

  @IsOptional()
  @IsString()
  @Length(0, 250)
  campaign_name?: string;

  @IsOptional()
  @IsString()
  survey_first_audio_file?: string;
}