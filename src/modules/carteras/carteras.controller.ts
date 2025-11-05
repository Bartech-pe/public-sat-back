import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateCarteraDto } from './dto/create-cartera.dto';
import { UpdateCarteraDto } from './dto/update-cartera.dto';
import { Cartera } from './entities/cartera.entity';
import { CarteraService } from './carteras.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
@Controller('cartera')
export class CarteraController {
  constructor(private readonly service: CarteraService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Cartera>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Cartera> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCarteraDto): Promise<Cartera> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCarteraDto,
  ): Promise<Cartera> {
    return this.service.update(+id, dto);
  }

  @Get('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Cartera> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
