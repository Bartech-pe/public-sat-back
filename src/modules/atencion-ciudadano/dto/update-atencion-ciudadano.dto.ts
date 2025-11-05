import { PartialType } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
import { CreateAtencionCiudadanoDto } from './create-atencion-ciudadano.dto';
export class UpdateAtencionCiudadanoDto extends PartialType(
  CreateAtencionCiudadanoDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
