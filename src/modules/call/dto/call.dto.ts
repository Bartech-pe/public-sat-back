import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallDTO {
  @ApiProperty({
    description: 'Agent',
    example: 'sdffds',
  })
  @IsString()
  @IsNotEmpty()
  agent: string;
  @ApiProperty({
    description: 'Client',
    example: 'dsada',
  })
  @IsString()
  @IsNotEmpty()
  client: string;
}

export class InterferCallDTO {
  @ApiProperty({
    description: 'Agent',
    example: 'sdffds',
  })
  @IsString()
  @IsNotEmpty()
  agent: string;
  @ApiProperty({
    description: 'Client',
    example: 'dsada',
  })
  @IsString()
  @IsNotEmpty()
  client: string;
  @ApiProperty({
    description: 'Extension',
    example: 'dsada',
  })
  @IsString()
  @IsNotEmpty()
  extension: string;
}

