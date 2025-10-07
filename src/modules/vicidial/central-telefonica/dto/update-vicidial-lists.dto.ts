import { PartialType } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';
import { CreateVicidialLeadDto } from './lead-list.dto';

export class UpdateVicidialListDto extends PartialType(CreateVicidialLeadDto) {
    @IsString()
    @Length(1, 50)
    lead_id: number;
}
