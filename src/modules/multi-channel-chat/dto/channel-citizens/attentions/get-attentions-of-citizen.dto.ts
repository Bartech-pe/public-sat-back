import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { Channels } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ChannelQueryHistory } from '@modules/multi-channel-chat/entities/channel-query-history.entity';

export class GetAttentionsOfCitizenDto {
  @ApiProperty({ description: 'Fecha y hora de la atención (ISO 8601)' })
  @IsNotEmpty({ message: v.isNotEmpty('startDate') })
  @IsDate({ message: v.isDate('startDate') })
  startDate: Date;

  @ApiProperty({ description: 'Fecha y hora de la atención (ISO 8601)' })
  @IsOptional()
  endDate?: Date | null;

  @ApiProperty({ description: 'Tipo de atención (ej: llamada, chat, presencial)' })
  @IsNotEmpty({ message: v.isNotEmpty('type') })
  @IsString({ message: v.isString('type') })
  type: string;

  @ApiProperty({ description: 'Categoría de la atención' })
  @IsNotEmpty({ message: v.isNotEmpty('category') })
  @IsString({ message: v.isString('category') })
  category: string;

  @ApiProperty({ description: 'Canal de la atención (ej: teléfono, WhatsApp, web)' })
  @IsNotEmpty({ message: v.isNotEmpty('channel') })
  channel?: string;

  @ApiProperty({ description: 'Indica si hubo intervención de un asesor o bot', required: false })
  @IsOptional()
  @IsBoolean({ message: v.isBoolean('advisorIntervention') })
  advisorIntervention?: boolean;

  @ApiProperty({ description: 'Nombre o identificador del asesor', required: false })
  @IsOptional()
  @IsString({ message: v.isString('user') })
  user?: string;

  @ApiProperty({ description: 'Correo electrónico (chatsat)', required: false })
  @IsOptional()
  @IsString({ message: v.isString('email') })
  email?: string;

  queryHistory?: ChannelQueryHistory[]
}
