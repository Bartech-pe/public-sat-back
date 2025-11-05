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
import { MensajeAutomaticoService } from './mensaje-automatico.service';
import { CreateMensajeAutomaticoDto } from './dto/create-mensaje-automatico.dto';
import { UpdateMensajeAutomaticoDto } from './dto/update-mensaje-automatico.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { MensajeAutomatico } from './entities/mensaje-automatico.entity';

@Controller('mensaje-automatico')
export class MensajeAutomaticoController {
  constructor(private readonly service: MensajeAutomaticoService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<MensajeAutomatico>> {
   
    const offset = query.offset!;
    return this.service.findAll( offset);
  }

  // @Get(':id')
  // findOne(@Param('id') id: number): Promise<MensajeAutomatico> {
  //   return this.service.findOne(+id);
  // }

  @Post()
  create(@Body() dto: CreateMensajeAutomaticoDto): Promise<MensajeAutomatico> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateMensajeAutomaticoDto,
  ): Promise<MensajeAutomatico> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
