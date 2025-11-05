import { PartialType } from '@nestjs/swagger';
import { CreateCarteraDetalleDto } from './create-cartera-detalle.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateCarteraDetalleDto extends PartialType(
  CreateCarteraDetalleDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;
}
