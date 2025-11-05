import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CarteraDetalleService } from './cartera-detalle.service';
import { CreateCarteraDetalleDto } from './dto/create-cartera-detalle.dto';
import { UpdateCarteraDetalleDto } from './dto/update-cartera-detalle.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CarteraDetalle } from './entities/cartera-detalle.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import {
  ReasignCarteraDetalleDto,
  ReasignCarteraDetalleListDto,
} from './dto/reasign-cartera-detalle.dto';
import { InformacionCasoDto } from './dto/informacion-caso.dto';
import { InformacionCaso } from './entities/informacion-caso.entity';

@Controller('cartera-detalle')
export class CarteraDetalleController {
  constructor(private readonly service: CarteraDetalleService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CarteraDetalle>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get('detalle/:id')
  findByCartera(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CarteraDetalle[]> {
    return this.service.findByCarteraId(id);
  }

  @Get('detalleByUserToken')
  findByUser(@CurrentUser() user: User): Promise<CarteraDetalle[]> {
    return this.service.findByUserId(user?.id);
  }

  @Get('detalleByUserId/:id')
  findByUserId(@Param('id') id: number): Promise<CarteraDetalle[]> {
    return this.service.findByUserId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CarteraDetalle> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCarteraDetalleDto): Promise<CarteraDetalle> {
    return this.service.create(dto);
  }

  @Post('createOrUpdateInfoCaso/:id')
  createOrUpdateInfoCaso(
    @Param('idDetalle') idDetalle: number,
    @Body() dto: InformacionCasoDto,
  ): Promise<InformacionCaso> {
    return this.service.createOrUpdateInfoCaso(idDetalle, dto);
  }

  @Patch('reasigUser')
  reasigUser(
    @Body() body: ReasignCarteraDetalleListDto,
  ): Promise<CarteraDetalle[]> {
    return this.service.reasigUser(body.dtoList);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCarteraDetalleDto,
  ): Promise<CarteraDetalle> {
    return this.service.update(+id, dto);
  }

  @Put('toggleCarteraDetalle/:id')
  toggleCarteraDetalle(@Param('id') id: number): Promise<CarteraDetalle> {
    return this.service.toggleCarteraDetalle(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
