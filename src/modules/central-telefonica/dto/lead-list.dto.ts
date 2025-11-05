import { IsInt, IsOptional, IsString, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreateVicidialLeadDto {

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsString()
  @MaxLength(50)
  phone_number: string;

  @IsOptional()
  @IsInt()
  list_id?: number;
}
