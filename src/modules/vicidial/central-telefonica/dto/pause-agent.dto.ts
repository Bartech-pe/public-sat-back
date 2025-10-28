import { Transform } from 'class-transformer';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class PauseAgentDto {
  @ValidateIf((o) => o.pauseCode)
  @IsString()
  pauseCode: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  concluded?: boolean;
}
