import { ApiProperty } from '@nestjs/swagger';

export class BotStatusChangedDto {
  @ApiProperty({ description: 'ID del canal', example: 1 })
  channelRoomId: number;

  @ApiProperty({ description: 'Estado de respuestas del bot', example: false })
  botReplies: boolean;
}
