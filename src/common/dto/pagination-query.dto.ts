import { IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Número máximo de resultados a devolver',
    minimum: 0,
    default: null,
  })
  @IsOptional()
  @IsInt({ message: v.isInt('limit') })
  @Min(0, { message: v.min('limit', 0) })
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Número de resultados a omitir desde el inicio',
    minimum: 0,
    default: null,
  })
  @IsOptional()
  @IsInt({ message: v.isInt('offset') })
  @Min(0, { message: v.min('offset', 0) })
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Se filtran los resultados por usuario autenticado',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  q?: Record<string, any>;
}
