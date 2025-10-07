import { IsInt, IsOptional, IsString, IsEnum, MaxLength, ValidateNested, IsNotEmpty, IsArray } from 'class-validator';
import { CreateVicidialLeadDto } from './lead-list.dto';
import { Type } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';
export class CreateVicidialListDto {
  @IsInt()
  list_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  list_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  list_description?: string;

  @IsString()
  @MaxLength(20)
  campaign_id: number;

  @IsOptional()
  @IsEnum(['Y', 'N'])
  active?: 'Y' | 'N' = 'Y';

  @IsArray()
  @IsNotEmpty({ message: v.isNotEmpty('dtoList') })
  @ValidateNested({ each: true }) 
  @Type(() => CreateVicidialLeadDto) 
  dtoList: CreateVicidialLeadDto[];
}
