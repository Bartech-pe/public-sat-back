import { IsDate, IsOptional, IsString } from "class-validator";

export class UpdateFeriado {
    @IsDate()
    @IsOptional()
    feriado_fecha: Date;
    @IsString()
    @IsOptional()
    feriado_titulo: string;
    @IsString()
    @IsOptional()
    feriado_descripcion: string;
}
