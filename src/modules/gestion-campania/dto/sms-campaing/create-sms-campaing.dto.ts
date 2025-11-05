import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator"

export class CreateSmsCampaing {
    @IsString()
    nombre: string;
    @IsNumber()
    id_area_campania: number;
    @IsNumber()
    id_estado_campania: number;
     @IsNumber()
    createUser: number;
    @IsString()
    senderId: string
    @IsString()
    contact: string
    @IsBoolean()
    @IsOptional()
    countryCode?: boolean | null
    @IsArray()
    rows: any[];
    @IsString()
    message: string
}
