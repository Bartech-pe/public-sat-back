import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AsignarCarteraService } from './asignar-cartera.service';
import { CreateAsignarCarteraDto } from './dto/create-asignar-cartera.dto';
import { UpdateAsignarCarteraDto } from './dto/update-asignar-cartera.dto';
import { AsignarCartera } from './entities/asignar-cartera.entity';
import { AsignarDetallesDto } from './dto/detalle-asignar.dto';

@Controller('asignar-cartera')
export class AsignarCarteraController {

  constructor(private readonly asignarCarteraService: AsignarCarteraService) {}

  @Post()
  create(
    @Body() createAsignarCarteraDto: CreateAsignarCarteraDto) {
    return this.asignarCarteraService.create(createAsignarCarteraDto);
  }

  @Post('/multiple')
  createMultiple(
    @Body() createAsignarCarteraDto: AsignarDetallesDto) {
    return this.asignarCarteraService.createMultiple(createAsignarCarteraDto.detalles);
  }

  @Get('detalle/:idUser')
  findByCartera(@Param('idUser', ParseIntPipe) id: number): Promise<AsignarCartera[]> {
        return this.asignarCarteraService.findByCarteraId(id);
  }

  @Get()
  findAll() {
    return this.asignarCarteraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asignarCarteraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAsignarCarteraDto: UpdateAsignarCarteraDto) {
    return this.asignarCarteraService.update(+id, updateAsignarCarteraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asignarCarteraService.remove(+id);
  }
}
