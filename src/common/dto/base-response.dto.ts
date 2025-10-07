import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = void> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operación realizada con éxito' })
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
