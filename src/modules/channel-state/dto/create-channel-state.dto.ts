import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsUniqueComposite } from '@common/validators/is-unique-composite/is-unique-composite.decorator';
import { ChannelState } from '../entities/channel-state.entity';

export class CreateChannelStateDto {
  @IsUniqueComposite(
    {
      model: ChannelState,
      fields: ['name', 'categoryId'],
    },
    {
      message: 'Ya existe el estado para esta canal',
    },
  )
  readonly uniqueCheck: string;

  @ApiProperty({ description: 'Nombre de estado' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @ApiProperty({
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

  @ApiProperty({
    description: 'Categoría del estado',
  })
  @IsNumber({}, { message: v.isNumber('categoryId') })
  @IsNotEmpty({ message: v.isNotEmpty('categoryId') })
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Tipo del estado (booleano)',
  })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
