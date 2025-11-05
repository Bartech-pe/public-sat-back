import { PartialType } from '@nestjs/swagger';
import { CreateEstadoCampaniaDto } from './create-estado-campania.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateEstadoCampaniaDto extends PartialType(
  CreateEstadoCampaniaDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
