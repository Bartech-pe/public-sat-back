import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RecordingDTO {
  @ApiProperty({
        description: 'channel',
        example: 'sdffds',
      })
  @IsString()
  @IsNotEmpty()
  channel: string;
  @ApiProperty({
        description: 'agent',
        example: 'sdffds',
      })
  @IsString()
  @IsNotEmpty()
  agent: string;
}
