import { PartialType } from '@nestjs/swagger';
import { CreateEmailSignatureDto } from './create-email-signature.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateEmailSignatureDto extends PartialType(
  CreateEmailSignatureDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
