import { PartialType } from '@nestjs/swagger';
import { CreateSurveyDto } from './create-survey.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
      @IsNumber({}, { message: v.isNumber('id') })
      id: number;
}
