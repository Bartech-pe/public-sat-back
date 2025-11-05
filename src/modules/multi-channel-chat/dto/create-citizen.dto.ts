import { IsBoolean, IsNotEmpty, isNumber, IsNumber, IsOptional, IsString } from "class-validator";
import { ValidationMessages as v } from "@common/messages/validation-messages";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCitizenDto {
  
  @ApiProperty({ description: 'Nombre la bandeja de entrada' })
  @IsNotEmpty({ message: v.isNotEmpty('name') })
  @IsString({ message: v.isString('name') })
  name: string;

  @IsOptional()
  @IsNumber({}, { message: v.isNumber('externalUserId') })
  externalUserId?: string;

  @IsOptional()
  @IsString({ message: v.isString('phoneNumber') })
  phoneNumber?: string;
  
  @ApiProperty({ description: 'Indica si viene de el chat Externo' })
  @IsNotEmpty({ message: v.isNotEmpty('isExternal') })
  @IsBoolean({ message: v.isBoolean('isExternal') })
  isExternal: boolean;
  
  @IsOptional()
  @IsString({ message: v.isString('email') })
  email?: string;
  
  @IsOptional()
  @IsString({ message: v.isString('avatarUrl') })
  avatarUrl?: string;

}


// export class CreateInboxDto {
//   @ApiProperty({ description: 'Nombre la bandeja de entrada' })
//   @IsNotEmpty({ message: v.isNotEmpty('name') })
//   @IsString({ message: v.isString('name') })
//   @IsUnique(Inbox, 'name', { message: v.isUnique('name') })
//   name: string;

//   @ApiPropertyOptional({
//     description: 'Url del avatar de la bandeja de entrada',
//   })
//   @IsOptional()
//   @IsString({ message: v.isString('avatarUrl') })
//   avatarUrl?: string;

//   @ApiPropertyOptional({
//     description: 'Color de la bandeja de entrada',
//   })
//   @IsOptional()
//   @IsString({ message: v.isString('widgetColor') })
//   widgetColor?: string;

//   @ApiProperty({ description: 'Id del canal' })
//   @IsNumber({}, { message: v.isNumber('idChannel') })
//   idChannel: number;

//   @ApiPropertyOptional({
//     description: 'Número de teléfono de la bandeja de entrada',
//   })
//   @IsOptional()
//   @IsString({ message: v.isString('phoneNumber') })
//   phoneNumber?: string;

//   @IsOptional()
//   @IsBoolean({ message: v.isBoolean('status') })
//   @Transform(({ value }) => value === 'true' || value === true)
//   status?: boolean;
// }