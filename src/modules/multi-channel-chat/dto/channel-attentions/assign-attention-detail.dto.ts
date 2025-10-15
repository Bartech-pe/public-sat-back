import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsNumber, IsOptional } from 'class-validator';

export class AssignAttentionDetailDto {
  @ApiProperty({ description: 'ID de la asistencia (Assitances)' })
  @IsNumber({}, { message: v.isNumber('attentionId') })
  @IsOptional()
  attentionId?: number;

  @ApiProperty({ description: 'ID del tipo de consulta (consult_type_id)' })
  @IsNumber({}, { message: v.isNumber('consultTypeId') })
  @IsOptional()
  consultTypeId?: number;

  @ApiProperty({ description: 'Detalle de asistencia' })
  @IsOptional()
  attentionDetail?: string;
}
