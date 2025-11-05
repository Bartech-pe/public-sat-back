import { IsDate, IsString } from "class-validator";

export class CreateFeriado {
    @IsDate()
    feriado_fecha: Date;
    @IsString()
    feriado_titulo: string;
    @IsString()
    feriado_descripcion: string;
}
