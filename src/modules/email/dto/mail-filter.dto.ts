import { IsNumber, IsOptional, IsString } from 'class-validator';
import { MailType } from '../enum/mail-type.enum';

export class MailFilter {
  @IsNumber()
  @IsOptional()
  advisorEmailId: number;

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
  notContains: string;

  @IsString()
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  type: MailType;
}
