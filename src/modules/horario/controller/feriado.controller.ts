import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { FeriadoService } from "../service/feriado.service";
import { CreateFeriado } from "../dto/feriado/create-feriado.dto";
import { UpdateFeriado } from "../dto/feriado/update-feriado.dto";

@Controller('feriado')
export class FeriadoController {
    constructor(private readonly service: FeriadoService) { }
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findOne(id);
    }
    @Get('date/:date')
    findByDate(@Param('date') date: Date) {
        return this.service.findbyDate(date);
    }
    @Get()
    async findAll(){
      return this.service.findAll();
    }
    @Post()
    create(
        @Body() dto: CreateFeriado,
    ) {
        return this.service.create(dto);
    }
    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() dto: UpdateFeriado,
    ) {
        return this.service.update(+id, dto);
    }
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.service.delete(id);
    }

}
