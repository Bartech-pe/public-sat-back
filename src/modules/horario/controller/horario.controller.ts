import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { HorarioService } from "../service/horario.service";
import { CreateHorario } from "../dto/horario/create-horario.dto";
import { UpdateHorario } from "../dto/horario/update-horario.dto";

@Controller('horario')
export class HorarioController {
    constructor(private readonly service: HorarioService) { }
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findById(id);
    }
     @Get('campania/:id')
    findByCampania(@Param('id') id: number) {
        return this.service.findByCampingId(id);
    }
    @Get('week/days')
    getDays() {
        return this.service.getAllDays();
    }
    @Post()
    create(
        @Body() dto: CreateHorario,
    ) {
        return this.service.create(dto);
    }
    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() dto: UpdateHorario,
    ) {
        return this.service.update(+id, dto);
    }
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.service.delete(id);
    }
    @Delete('campain/:id')
    removeByCampain(@Param('id') id: number) {
        return this.service.deleteByCampain(id);
    }
    
}
