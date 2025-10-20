import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class PauseAgentDto {
  @ValidateIf((o) => o.pauseCode !== '')
  @IsEnum(VicidialPauseCode)
  pauseCode: VicidialPauseCode | '';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  concluded?: boolean;
}
