import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Nombre de la campaña' })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiProperty({ description: 'Descripción de la campaña' })
  @IsString({ message: v.isString('description') })
  description: string;

  @ApiProperty({ description: 'Tipo de campaña (ID de CampaignType)' })
  @IsNumber({}, { message: v.isNumber('campaignTypeId') })
  campaignTypeId: number;

  @ApiProperty({ description: 'Área asignada a la campaña (ID de Department)' })
  @IsNumber({}, { message: v.isNumber('departmentId') })
  departmentId: number;

  @ApiProperty({ description: 'Estado de la campaña (ID de CampaignState)' })
  @IsNumber({}, { message: v.isNumber('campaignStateId') })
  campaignStateId: number;

  @ApiProperty({ description: 'Fecha de inicio de la campaña' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('startDate') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  })
  startDate?: Date;

  @ApiProperty({ description: 'Fecha de finalización de la campaña' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('endDate') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Hora de inicio de la campaña' })
  @IsOptional()
  @IsDate({ message: v.isDate('startTime') })
  startTime?: Date;

  @ApiPropertyOptional({ description: 'Hora de fin de la campaña' })
  @IsOptional()
  @IsDate({ message: v.isDate('endTime') })
  endTime?: Date;

  @ApiPropertyOptional({
    description: 'Día de la semana de inicio de la campaña',
  })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('startDay') })
  startDay?: number;

  @ApiPropertyOptional({ description: 'Día de la semana de fin de la campaña' })
  @IsOptional()
  @IsNumber({}, { message: v.isNumber('endDay') })
  endDay?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('applyHoliday') })
  @Transform(({ value }) => value === 'true' || value === true)
  applyHoliday?: boolean;

  @ApiProperty({ description: 'Fecha de vigencia de la campaña' })
  @Type(() => Date)
  @IsDate({ message: v.isDate('validUntil') })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  })
  validUntil?: Date;

  @ApiProperty({
    description: 'Identificador de campaña en sistema externo (VD)',
    type: Number, // 👈 opcional, pero ayuda a Swagger
  })
  @IsInt({ message: v.isInt('vdCampaignId') }) // 👈 cambia IsString por IsInt
  @IsOptional()
  vdCampaignId?: number;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
