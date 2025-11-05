import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaCampaniaDto } from './create-area-campania.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateAreaCampaniaDto extends PartialType(CreateAreaCampaniaDto) {
    @IsNumber({}, { message: v.isNumber('id') })
    id: number;
}
