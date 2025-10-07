import { PartialType } from '@nestjs/swagger';
import { CreatePredefinedResponseDto } from './create-predefined-response.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
export class UpdatePredefinedResponseDto extends PartialType(CreatePredefinedResponseDto) {
 @IsNumber({}, { message: v.isNumber('id') })
 id: number;
}
