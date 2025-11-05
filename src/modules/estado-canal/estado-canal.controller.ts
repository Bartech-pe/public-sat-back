import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstadoCanalService } from './estado-canal.service';
import { CreateEstadoCanalDto } from './dto/create-estado-canal.dto';
import { UpdateEstadoCanalDto } from './dto/update-estado-canal.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { EstadoCanal } from './entities/estado-canal.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Controller('estado-canal')
export class EstadoCanalController {
  constructor(private readonly service: EstadoCanalService) {}
  
    @Get()
    findAll(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResponse<EstadoCanal>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<EstadoCanal> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateEstadoCanalDto): Promise<EstadoCanal> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() dto: UpdateEstadoCanalDto,
    ): Promise<EstadoCanal> {
      return this.service.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
