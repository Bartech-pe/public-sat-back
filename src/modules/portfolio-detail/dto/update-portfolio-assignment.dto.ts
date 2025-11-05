import { PartialType } from '@nestjs/mapped-types';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
import { CreatePortfolioAssignmentDto } from './create-portfolio-assignment.dto';

export class UpdatePortfolioAssignmentDto extends PartialType(
  CreatePortfolioAssignmentDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
