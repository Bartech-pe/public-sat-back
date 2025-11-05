import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EstadoCampaniaService } from './estado-campania.service';
import { CreateEstadoCampaniaDto } from './dto/create-estado-campania.dto';
import { UpdateEstadoCampaniaDto } from './dto/update-estado-campania.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { EstadoCampania } from './entities/estado-campania.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Controller('estado-campania')
export class EstadoCampaniaController {
  constructor(private readonly estadoCampaniaService: EstadoCampaniaService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EstadoCampania>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.estadoCampaniaService.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<EstadoCampania> {
    return this.estadoCampaniaService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateEstadoCampaniaDto): Promise<EstadoCampania> {
    return this.estadoCampaniaService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEstadoCampaniaDto,
  ): Promise<EstadoCampania> {
    return this.estadoCampaniaService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.estadoCampaniaService.remove(+id);
  }
}
