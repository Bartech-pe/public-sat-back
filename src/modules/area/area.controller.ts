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
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Area } from './entities/area.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

@Controller('areas')
export class AreaController {
  constructor(private readonly service: AreaService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Area>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Area> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateAreaDto): Promise<Area> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateAreaDto): Promise<Area> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Area> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
