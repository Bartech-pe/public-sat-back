import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuickResponseDto {
  @ApiProperty({
    description: 'isActive',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
  @ApiProperty({
    description: 'title',
    example: 'title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'content',
    example: 'content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
  @ApiProperty({
    description: 'quickResponseCategoryId',
    example: 0,
  })
  @IsNumber()
  quickResponseCategoryId: number;
  @ApiProperty({
    description: 'keywords',
    example: 'palo,see',
  })
  @IsOptional()
  @IsString()
  keywords?: string;
}
