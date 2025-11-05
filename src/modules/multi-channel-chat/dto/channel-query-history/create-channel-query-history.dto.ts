import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { QueryType, DocumentType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

export class CreateChannelQueryHistoryDto {
  @ApiProperty({
    enum: QueryType,
    example: 'tickets_by_plate',
    description: 'Tipo de consulta realizada',
  })
  @IsEnum(QueryType, { message: 'El tipo de consulta no es válido' })
  @IsNotEmpty({ message: 'El tipo de consulta es obligatorio' })
  queryType: QueryType; 

  @ApiProperty({
    enum: DocumentType,
    example: 'plate',
    description: 'Tipo de documento utilizado en la consulta',
  })
  @IsEnum(DocumentType, { message: 'El tipo de documento no es válido' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  documentType: DocumentType;

  @ApiProperty({
    example: 'ABC123',
    description: 'Valor del documento ingresado',
  })
  @IsString({ message: 'El valor del documento debe ser un texto' })
  @IsNotEmpty({ message: 'El valor del documento es obligatorio' })
  @MaxLength(100, { message: 'El valor del documento no debe exceder los 100 caracteres' })
  documentValue: string;
}
