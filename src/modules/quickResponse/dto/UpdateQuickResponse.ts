import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateQuickResponseDto {
  @ApiProperty({
    description: 'isActive',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiProperty({
    description: 'title',
    example: 'tittle',
  })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({
    description: 'content',
    example: 'content',
  })
  @IsOptional()
  @IsString()
  content?: string;
  @ApiProperty({
    description: 'quickResponseCategoryId',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  quickResponseCategoryId?: number;
  @ApiProperty({
    description: 'keywords',
    example: 'fge,grr',
  })
  @IsOptional()
  @IsString()
  keywords?: string;
}
