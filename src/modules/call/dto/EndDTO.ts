import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EndDTO {
  @ApiProperty({
      description: 'channel',
      example: 'sdffds',
    })
  @IsString()
  @IsNotEmpty()
  channel: string;
}
