import { IsBoolean, IsDate, IsNumber, IsOptional } from "class-validator";

export class UpdateHorario {
    @IsDate()
    @IsOptional()
    hora_inicio: Date
    @IsDate()
    @IsOptional()
    hora_fin: Date
    @IsNumber()
    @IsOptional()
    dia_inicio: number;
    @IsNumber()
    @IsOptional()
    dia_fin: number;
    @IsBoolean()
    @IsOptional()
    feriado: boolean
}
