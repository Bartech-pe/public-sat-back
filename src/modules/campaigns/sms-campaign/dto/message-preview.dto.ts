import { IsArray, IsNotEmpty, IsString } from 'class-validator';
export class MessagePreview {
  @IsArray()
  rows!: any[];

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  contact!: string;
}
