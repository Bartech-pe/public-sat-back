import { IsBoolean, IsDate, IsNumber } from "class-validator";

export class CreateHorario {
    @IsDate()
    hora_inicio: Date
    @IsDate()
    hora_fin: Date
    @IsNumber()
    dia_inicio: number;
    @IsNumber()
    dia_fin: number;
    @IsBoolean()
    feriado: boolean;
    @IsNumber()
    gestion_campania_id:number;
}
