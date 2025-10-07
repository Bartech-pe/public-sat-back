import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSmsCampaing {
  @IsString()
  name: string;

  @IsNumber()
  departmentId: number;

  @IsNumber()
  campaignStateId: number;

  @IsNumber()
  createUser: number;

  @IsString()
  senderId: string;

  @IsString()
  contact: string;

  @IsBoolean()
  @IsOptional()
  countryCode?: boolean | null;

  @IsArray()
  rows: any[];

  @IsString()
  message: string;
}
