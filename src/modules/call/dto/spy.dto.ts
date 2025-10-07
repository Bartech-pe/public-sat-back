import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class SpyDTO {
  @ApiProperty({
      description: 'admin',
      example: 'sdffds',
    })
  @IsString()
  @IsNotEmpty()
  admin: string;
  @ApiProperty({
      description: 'destiny',
      example: 'sdffds',
    })
  @IsString()
  @IsNotEmpty()
  destiny: string;

  @ApiProperty({
      description: 'volume',
      example: 0,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  volume?: number;
}
