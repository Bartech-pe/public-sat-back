import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Type } from 'class-transformer';
import { CreateVicidialLeadDto } from './lead-list.dto';

export class CreateListDto {
  @IsArray()
  @IsNotEmpty({ message: v.isNotEmpty('dtoList') })
  @ValidateNested({ each: true }) 
  @Type(() => CreateVicidialLeadDto) 
  dtoList: CreateVicidialLeadDto[];
}
