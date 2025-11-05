import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CampaignState } from '../entities/campaign-state.entity';

export class CreateCampaignStateDto {
  @ApiProperty({ description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @IsUnique(CampaignState, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    description: 'Color del estado',
  })
  @IsString({ message: v.isString('color') })
  color?: string;

  @ApiPropertyOptional({
    description: 'Descripción de lo que representa este estado',
  })
  @IsOptional()
  @IsString({ message: v.isString('description') })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
