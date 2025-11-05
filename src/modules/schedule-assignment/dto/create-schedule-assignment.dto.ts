import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsArray, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';

// export class ScheduleDayDto {
//   @ApiProperty({ description: 'Start time of the schedule' })
//   @IsDateString()
//   startTime?: string;

//   @ApiProperty({ description: 'End time of the schedule', required: false })
//   @IsDateString()
//   endTime?: string;   
// }

export class CreateScheduleAssignmentDto {

  @ApiProperty({ description: 'mes', example: '2025-09-01T05:00:00.000Z' })
  @IsNotEmpty()
  month: Date;

  @ApiProperty({ description: 'id canaales', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  idChanel: number;

  // @ApiProperty({ 
  //   description: 'Array of schedule days',
  //   type: [ScheduleDayDto],
  //   example: [
  //     {
  //       startTime: '2025-09-16T13:07:12.991Z',
  //       endTime: '2025-09-16T22:07:00.722Z'
  //     }
  //   ]
  // })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => ScheduleDayDto)
  // days: ScheduleDayDto[];

  @ApiPropertyOptional({
      description: 'Dias',
  })
  @IsOptional()
  @IsString({ message: v.isString('days') })
  days: string;

}
