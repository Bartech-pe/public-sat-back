import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { AreaCampaniaService } from './area-campania.service';
import { CreateAreaCampaniaDto } from './dto/create-area-campania.dto';
import { UpdateAreaCampaniaDto } from './dto/update-area-campania.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { AreaCampaniaResponse } from './entities/area-campania.entity';

@Controller('area-campania')
export class AreaCampaniaController {

  constructor(private readonly service: AreaCampaniaService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<AreaCampaniaResponse>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<AreaCampaniaResponse> {
    return this.service.findOne(+id);
  }

  @Post()
  create(
    @Body() dto: CreateAreaCampaniaDto,
  ): Promise<AreaCampaniaResponse> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAreaCampaniaDto,
  ): Promise<AreaCampaniaResponse> {
    return this.service.update(+id, dto);
  }

  @Put('toggleAreaCampaniaResponse/:id')
  toggleAreaCampaniaResponse(
    @Param('id') id: number,
  ): Promise<AreaCampaniaResponse> {
    return this.service.toggleAreaCampaniaResponse(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
