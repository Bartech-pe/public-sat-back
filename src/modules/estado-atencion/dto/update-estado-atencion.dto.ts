import { PartialType } from '@nestjs/swagger';
import { CreateEstadoAtencionDto } from './create-estado-atencion.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateEstadoAtencionDto extends PartialType(
  CreateEstadoAtencionDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
