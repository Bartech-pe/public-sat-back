import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreatePortfolioAssignmentDto {
  @IsNumber()
  portfolioDetailId: number;

  @IsNumber()
  userPrevId: number;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString({ message: 'motivo debe ser un texto' })
  motivo?: string;
}
