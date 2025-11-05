import { PartialType } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { CreateVicidialListDto } from './create-vicidial-lists.dto';

export class UpdateCreateListDto extends PartialType(CreateVicidialListDto) {
    @IsString()
    @Length(1, 50)
    list_id: number;
}

