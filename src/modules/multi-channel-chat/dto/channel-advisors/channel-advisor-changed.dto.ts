import { ApiProperty } from '@nestjs/swagger';

export class AdvisorChangedDto {
  @ApiProperty({ description: 'ID del canal', example: 1 })
  channelRoomId: number;

  @ApiProperty({ description: 'ID del canal', example: 1 })
  attentionId: number;

  @ApiProperty({ description: 'ID del usuario', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nombre interno del usuario (rol o identificador técnico)',
    example: 'Administrador',
  })
  name: string;

  @ApiProperty({
    description: 'Nombre visible del usuario',
    example: 'Administrador',
  })
  displayName: string;
}
