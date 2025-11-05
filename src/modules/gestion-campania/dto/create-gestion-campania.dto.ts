

import { IsString, IsOptional, IsNumber, IsDate, IsBoolean, isBoolean, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages';


export class CreateGestionCampaniaDto {

    @IsString()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsNumber()
    id_tipo_campania: number;

    @IsNumber()
    id_area_campania: number;

    @IsNumber()
    id_estado_campania: number;

    @ApiProperty({ description: 'Fecha de inicio' })
    @Type(() => Date)
    @IsDate({ message: v.isDate('fecha_inicio') })
    @Transform(({ value }) => {
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);
        return date;
    })
    fecha_inicio?: Date;

    @ApiProperty({ description: 'Fecha de fin' })
    @Type(() => Date)
    @IsDate({ message: v.isDate('fecha_fin') })
    @Transform(({ value }) => {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      return date;
    })
    fecha_fin?: Date;

    @ApiProperty({ description: 'Fecha de Vigencia' })
    @Type(() => Date)
    @IsDate({ message: v.isDate('fecha_vigencia') })
    @Transform(({ value }) => {
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);
        return date;
    })
    fecha_vigencia?: Date;

    @IsString()
    @IsOptional()
    campaniaId?: string;
    
    @IsNumber()
    createUser: number;


    @IsDate()
    @IsOptional()
    horario_inicio: Date
    @IsDate()
    @IsOptional()
    horario_fin: Date
    @IsNumber()
    @IsOptional()
    dia_inicio?: number;
    @IsNumber()
    @IsOptional()
    dia_fin?: number;
    @IsBoolean()
    @IsOptional()
    feriado?:boolean;
    
}
