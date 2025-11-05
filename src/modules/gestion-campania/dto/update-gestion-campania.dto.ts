import { PartialType } from '@nestjs/mapped-types';
import { CreateGestionCampaniaDto } from './create-gestion-campania.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
export class UpdateGestionCampaniaDto extends PartialType(CreateGestionCampaniaDto) {
    @IsNumber({}, { message: v.isNumber('id') })
    id: number;  
}
