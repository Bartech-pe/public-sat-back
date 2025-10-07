import { PartialType } from '@nestjs/swagger';
import { CreateChannelScheduleDto } from './create-channel-schedule.dto';
import { IsNumber } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateChannelScheduleDto extends PartialType(
  CreateChannelScheduleDto,
) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
