import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioDto } from './create-portfolio.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';
export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
