import { PartialType } from '@nestjs/swagger';
import { CreateMensajeAutomaticoDto } from './create-mensaje-automatico.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateMensajeAutomaticoDto extends PartialType(
  CreateMensajeAutomaticoDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
