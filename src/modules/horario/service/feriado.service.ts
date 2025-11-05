import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { FeriadoRepository } from "../repositories/feriado.repository";
import { CreateFeriado } from "../dto/feriado/create-feriado.dto";
import { UpdateFeriado } from "../dto/feriado/update-feriado.dto";

@Injectable()
export class FeriadoService {
    constructor(private readonly repository: FeriadoRepository) { }
    async findOne(id: number) {
        return await this.repository.findById(id);
    }
    async findAll() {
        const data = await this.repository.findAll();
        const feriados = data.map(a => a.toJSON());
        const result = feriados.map(a => ({
            start: new Date(a.feriado_fecha),
            end: undefined,
            title: a.feriado_titulo,
            color: { primary: '#ad2121', secondary: '#FAE3E3' }
        }));
        return result;
    }
    async findbyDate(feriado_fecha:Date){
        return await this.repository.findOne({where:{feriado_fecha}})
    }
    async create(body: CreateFeriado) {
        const feriado_fecha = body.feriado_fecha;
        const exist = await this.repository.findOne({ where: { feriado_fecha } })
        if (exist) {
            throw new NotFoundException('fecha ya existente');
        }
        try {
            return await this.repository.create(body);
        } catch (error) {
            throw new InternalServerErrorException(
                error,
                'Error interno del servidor',
            );
        }
    }
    async update(id:number,body:UpdateFeriado){
        const exist = await this.repository.findById(id);
        if (!exist) {
            throw new NotFoundException('feriado no existe');
        }
        try {
            return await this.repository.update(id,body);
        } catch (error) {
            throw new InternalServerErrorException(
                error,
                'Error interno del servidor',
            );
        }
    }
    async delete(id:number){
        const exist = await this.repository.findById(id);
        if (!exist) {
            throw new NotFoundException('feriado no existe');
        }
         try {
            return await this.repository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException(
                error,
                'Error interno del servidor',
            );
        }
    }
}
