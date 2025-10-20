import { IsInt, IsOptional, IsString, IsEnum, MaxLength, ValidateNested, IsNotEmpty, IsArray, Length } from 'class-validator';
import { CreateVicidialLeadDto } from './lead-list.dto';
import { Type } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty } from '@nestjs/swagger';

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

  // @IsString()
  // @MaxLength(20)
  // campaign_id: number;

  @IsString()
  @Length(1, 50)
  campaign_id: string;

  @IsOptional()
  @IsEnum(['Y', 'N'])
  active?: 'Y' | 'N' = 'Y';

   @ApiProperty({
      type: 'string',
      format: 'binary',
      description: 'Archivo Excel con los detalles de la cartera',
    })
    file: Express.Multer.File;

  // @IsArray()
  // @IsNotEmpty({ message: v.isNotEmpty('dtoList') })
  // @ValidateNested({ each: true }) 
  // @Type(() => CreateVicidialLeadDto) 
  // dtoList: CreateVicidialLeadDto[];


}
