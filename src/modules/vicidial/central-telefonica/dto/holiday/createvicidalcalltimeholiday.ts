import { Optional } from "@nestjs/common";
import { IsDate, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateVicidalCallTimeHoliday {
    @IsString()
    @Length(1, 30)
    holiday_id: number;
    @IsString()
    @Length(1, 100)
    holiday_name: string;
    @IsString()
    @IsOptional()
    @Length(1, 255)
    holiday_comments?: string;
    @IsDate()
    holiday_date: Date
    @IsNumber()
    @IsOptional()
    start:number;
    @IsNumber()
    @IsOptional()
    end:number;
}
