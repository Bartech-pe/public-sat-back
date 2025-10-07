import { PartialType } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
import { CreateCitizenAssistanceDto } from './create-citizen-assistance.dto';
export class UpdateCitizenAssistanceDto extends PartialType(
  CreateCitizenAssistanceDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
