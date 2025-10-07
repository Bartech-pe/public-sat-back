import { Optional } from "@nestjs/common";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Length } from "class-validator";
export class UpdateVicidialCallTime {
    @IsString()
    @IsOptional()
    @Length(1, 30)
    call_time_name?: string;
    @IsOptional()
    @IsNumber()
    start?:number;
    @IsOptional()
    @IsNumber()
    end?:number;
    @IsOptional()
    @IsNumber()
    mondayStart?:number;
    @IsOptional()
    @IsNumber()
    mondayEnd?:number;
    @IsOptional()
    @IsNumber()
    tuesdayStart?:number;
    @IsOptional()
    @IsNumber()
    tuesdayEnd?:number;
    @IsOptional()
    @IsNumber()
    wednesdayStart?:number;
    @IsOptional()
    @IsNumber()
    wednesdayEnd?:number;
    @IsOptional()
    @IsNumber()
    thursdayStart?:number;
    @IsOptional()
    @IsNumber()
    thursdayEnd?:number;
    @IsOptional()
    @IsNumber()
    fridaydayStart?:number;
    @IsOptional()
    @IsNumber()
    fridayEnd?:number;
    @IsOptional()
    @IsNumber()
    saturdayStart?:number;
    @IsOptional()
    @IsNumber()
    saturdayEnd?:number;
    @IsOptional()
    @IsNumber()
    sundayStart?:number;
    @IsOptional()
    @IsNumber()
    sundayEnd?:number;
    @IsBoolean()
    everyday:boolean;
    @IsOptional()
    holidays?:string[]
}
export class VicidialCallTimeBody {
    call_time_name: string;
    call_time_comments: string;
    ct_default_start: number
    ct_default_stop: number
    ct_sunday_start: number
    ct_sunday_stop: number
    ct_monday_start: number
    ct_monday_stop: number
    ct_tuesday_start: number
    ct_tuesday_stop: number
    ct_wednesday_start: number
    ct_wednesday_stop: number
    ct_thursday_start: number
    ct_thursday_stop: number
    ct_friday_start: number
    ct_friday_stop: number
    ct_saturday_start: number
    ct_saturday_stop: number
    ct_holidays: string
}
