import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstadoAtencionService } from './estado-atencion.service';
import { CreateEstadoAtencionDto } from './dto/create-estado-atencion.dto';
import { UpdateEstadoAtencionDto } from './dto/update-estado-atencion.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EstadoAtencion } from './entities/estado-atencion.entity';

@Controller('estado-atencion')
export class EstadoAtencionController {
  constructor(private readonly service: EstadoAtencionService) {}

  @Get()
    findAll(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResponse<EstadoAtencion>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<EstadoAtencion> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateEstadoAtencionDto): Promise<EstadoAtencion> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() dto: UpdateEstadoAtencionDto,
    ): Promise<EstadoAtencion> {
      return this.service.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
