import { IsNumber, IsOptional, IsString } from 'class-validator';
import { MailType } from '../enum/mail-type.enum';

export class MailFilter {
  @IsNumber()
  @IsOptional()
  userId: number;

  @IsNumber()
  @IsOptional()
  stateId: number;

  @IsString()
  @IsOptional()
  from: string;

  @IsString()
  @IsOptional()
  to: string;

  @IsString()
  @IsOptional()
  contains: string;

  @IsString()
  @IsOptional()
  startDate: Date;

  @IsString()
  @IsOptional()
  endDate: Date;

  @IsString()
  @IsOptional()
  type: MailType;
}
