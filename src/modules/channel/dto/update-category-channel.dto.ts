import { PartialType } from '@nestjs/swagger';
import { CreateCategoryChannelDto } from './create-category-channel.dto';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber } from 'class-validator';

export class UpdateCategoryChannelDto extends PartialType(CreateCategoryChannelDto) {
  @IsNumber({}, { message: v.isNumber('id') })
  id: number;
}
