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
} from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { AtencionCiudadanoService } from './atencion-ciudadano.service';
import { AtencionCiudadano } from './entities/atencion-ciudadano.entity';
import { CreateAtencionCiudadanoDto } from './dto/create-atencion-ciudadano.dto';
import { UpdateAtencionCiudadanoDto } from './dto/update-atencion-ciudadano.dto';

@Controller('atencion-ciudadano')
export class AtencionCiudadanoController {
  constructor(private readonly service: AtencionCiudadanoService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<AtencionCiudadano>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<AtencionCiudadano> {
    return this.service.findOne(+id);
  }

  @Get('findByCarteraDetalle/:id')
  findByCarteraDetalle(@Param('id') id: number): Promise<AtencionCiudadano[]> {
    return this.service.findByCarteraDetalle(+id);
  }

  @Get('findVerificacionByCarteraDetalle/:id')
  findVerificacionByCarteraDetalle(
    @Param('id') id: number,
  ): Promise<AtencionCiudadano[]> {
    return this.service.findVerificacionByCarteraDetalle(+id);
  }

  @Get('findByDocIde/:docIde')
  findByDocIde(@Param('docIde') docIde: string): Promise<AtencionCiudadano[]> {
    return this.service.findByDocIde(docIde);
  }

  @Post()
  create(@Body() dto: CreateAtencionCiudadanoDto): Promise<AtencionCiudadano> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAtencionCiudadanoDto,
  ): Promise<AtencionCiudadano> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<AtencionCiudadano> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
