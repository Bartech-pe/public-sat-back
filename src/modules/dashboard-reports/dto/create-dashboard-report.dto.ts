import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateDashboardReportDto {
  @ApiPropertyOptional({
    example: 12,
    description: 'Id del dashboard asociado (nullable)',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('dashboardId') })
  dashboardId?: number;

  @ApiProperty({
    example: 'Widget de métricas',
    description: 'Nombre del widget',
  })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiPropertyOptional({
    example: 'Widget para mostrar estadísticas diarias',
    description: 'Descripción del widget (opcional)',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @ApiProperty({
    example: 'metabase',
    enum: ['metabase', 'vicidial', 'custom'],
    description: 'Tipo de widget',
  })
  @IsEnum(['metabase', 'vicidial', 'custom'], {
    message: v.isEnum('type'),
  })
  type: 'metabase' | 'vicidial' | 'custom';

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del registro',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
