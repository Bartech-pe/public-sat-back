import { PartialType } from '@nestjs/swagger';
import { CreateVicidialCampaignDto } from './create-vicidial-campaing.dto';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateVicidialCampaignDto extends PartialType(CreateVicidialCampaignDto) {
    @IsString()
    @Length(1, 50)
    campaign_id: string;
}
