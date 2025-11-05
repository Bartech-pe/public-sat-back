import { PartialType } from '@nestjs/swagger';
import { CreateCampaingDto } from './create-campaing.dto';

export class UpdateCampaingDto extends PartialType(CreateCampaingDto) {}
