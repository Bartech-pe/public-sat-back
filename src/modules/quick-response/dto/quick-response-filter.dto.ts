import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QuickResponseFilter {
  @ApiProperty({
    description: 'category',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
  @ApiProperty({
    description: 'status',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
  @ApiProperty({
    description: 'orderBy',
    example: 'title',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderby?: 'title' | 'createdAt';
  @ApiProperty({
    description: 'search',
    example: 'papeleta',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
