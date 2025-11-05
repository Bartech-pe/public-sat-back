import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignarCarteraDto } from './create-asignar-cartera.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateAsignarCarteraDto extends PartialType(CreateAsignarCarteraDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
