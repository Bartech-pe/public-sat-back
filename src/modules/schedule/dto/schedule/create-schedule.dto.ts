import { IsBoolean, IsDate, IsNumber } from 'class-validator';

export class CreateScheduleDto {
  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsBoolean()
  isHoliday: boolean;

  @IsNumber()
  campaignId: number;
}
