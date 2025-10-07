import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

export class PauseAgentDto {
  @ValidateIf((o) => o.pauseCode !== '')
  @IsEnum(VicidialPauseCode)
  pauseCode: VicidialPauseCode | '';
}
