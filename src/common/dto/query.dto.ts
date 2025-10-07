import { IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Se filtran los resultados por usuario autenticado',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  q?: Record<string, any>;
}
