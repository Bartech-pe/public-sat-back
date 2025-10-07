import { PartialType } from '@nestjs/swagger';
import { CreateAssistanceStateDto } from './create-assistance-state.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateAssistanceStateDto extends PartialType(
  CreateAssistanceStateDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
