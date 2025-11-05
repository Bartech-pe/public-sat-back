
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateAreaCampaniaDto {

  @ApiPropertyOptional({
    example: 'por favor',
    description: 'titulo',
  })
  @IsOptional()
  @IsString({ message: v.isString('name') })
  name: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

}
