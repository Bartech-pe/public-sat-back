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
import { OficinaService } from './oficina.service';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Oficina } from './entities/oficina.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

@Controller('oficinas')
export class OficinaController {
  constructor(private readonly service: OficinaService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Oficina>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Oficina> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateOficinaDto): Promise<Oficina> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateOficinaDto,
  ): Promise<Oficina> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Oficina> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
