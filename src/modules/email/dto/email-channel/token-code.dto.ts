import { IsString } from 'class-validator';

export class Tokencode {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  email: string;

  @IsString()
  authenticated: boolean;
}
