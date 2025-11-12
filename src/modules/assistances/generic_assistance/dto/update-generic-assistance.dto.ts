import { PartialType } from '@nestjs/swagger';
import { CreateGenericAssistanceDto } from './create-generic-assistance.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateGenericAssistanceDto extends PartialType(
  CreateGenericAssistanceDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
