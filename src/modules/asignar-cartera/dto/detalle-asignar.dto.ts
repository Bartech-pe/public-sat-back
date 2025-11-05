import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AsignarCarteraDto } from './create-cartera-dto';

export class AsignarDetallesDto {
  @ValidateNested({ each: true })
  @Type(() => AsignarCarteraDto)
  detalles: AsignarCarteraDto[];
}