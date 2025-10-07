
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from '@common/validators/is-unique/is-unique.decorator';
import { Transform } from 'class-transformer';
import { TemplateEmail } from '../entities/template-email.entity';

export class CreateTemplateEmailDto {
  @ApiProperty({ example: 'plantilla', description: 'Nombre de plantilla' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsUnique(TemplateEmail, 'name', { message: v.isUnique('name') })
  name: string;

  @ApiPropertyOptional({
    example: '<h1>crear plantilla</h1>',
    description: 'Contenido HTML de la plantilla de correo',
  })
  @IsOptional()
  @IsString({ message: v.isString('template') })
  template: string;


  @IsOptional()
  @IsBoolean({ message: v.isBoolean('status') })
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;
}
