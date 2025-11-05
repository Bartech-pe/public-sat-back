import { PartialType } from '@nestjs/swagger';
import { CreateScheduleAssignmentDto } from './create-schedule-assignment.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
export class UpdateScheduleAssignmentDto extends PartialType(CreateScheduleAssignmentDto) {
      @IsNumber({}, { message: v.isNumber('id') })
        id: number;
}
