import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { TipoCampaniaService } from './tipo-campania.service';
import { CreateTipoCampaniaDto } from './dto/create-tipo-campania.dto';
import { UpdateTipoCampaniaDto } from './dto/update-tipo-campania.dto';
import { TipoCampaniaResponse } from './entities/tipo-campania.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Controller('tipo-campania')
export class TipoCampaniaController {
  constructor(private readonly service: TipoCampaniaService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<TipoCampaniaResponse>> {
     const limit = query.limit!;
     const offset = query.offset!;
    return this.service.findAll(limit, offset);
   }
 
  @Get(':id')
  findOne(@Param('id') id: number): Promise<TipoCampaniaResponse> {
     return this.service.findOne(+id);
  }
 
  @Post()
  create(
     @Body() dto: CreateTipoCampaniaDto,
  ): Promise<TipoCampaniaResponse> {
     return this.service.create(dto);
   }
 
  @Patch(':id')
  update(
     @Param('id') id: number,
     @Body() dto: UpdateTipoCampaniaDto,
   ): Promise<TipoCampaniaResponse> {
     return this.service.update(+id, dto);
  }
 
  @Put('toggleTipoCampaniaResponse/:id')
   toggleTipoCampaniaResponse(
     @Param('id') id: number,
   ): Promise<TipoCampaniaResponse> {
     return this.service.toggleTipoCampaniaResponse(id);
  }
 
  @Delete(':id')
   remove(@Param('id') id: number) {
     return this.service.remove(+id);
  }
}
