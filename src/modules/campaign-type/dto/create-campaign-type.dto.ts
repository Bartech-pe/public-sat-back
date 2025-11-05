import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ValidationMessages as v } from '@common/messages/validation-messages';

/**
 * DTO para la creación de un nuevo tipo de campaña.
 */
export class CreateCampaignTypeDto {
  @ApiProperty({ description: 'Nombre de la campaña' })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiProperty({ description: 'Descripción de la campaña' })
  @IsString({ message: v.isString('description') })
  description: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
