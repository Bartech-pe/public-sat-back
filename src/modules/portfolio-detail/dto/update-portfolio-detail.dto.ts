import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePortfolioDetailDto } from './create-portfolio-detail.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdatePortfolioDetailDto extends PartialType(
  CreatePortfolioDetailDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id?: number;

  @ApiPropertyOptional({
    description: 'Deuda actual del contribuyente (ciudadano)',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('currentDebt') })
  currentDebt: number;
}
