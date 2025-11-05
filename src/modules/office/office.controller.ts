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
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Office } from './entities/office.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleScreenOfficeDto } from './dto/create-role-screen.dto';
import { RoleScreenOffice } from './entities/role-screen-office.entity';

@ApiBearerAuth()
@Controller('offices')
export class OfficeController {
  constructor(private readonly service: OfficeService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Office>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Office> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateOfficeDto): Promise<Office> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateOfficeDto,
  ): Promise<Office> {
    return this.service.update(+id, dto);
  }

  @Post('assignment/:id')
  assignment(
    @Param('id') id: number,
    @Body() dto: CreateRoleScreenOfficeDto[],
  ): Promise<RoleScreenOffice[]> {
    return this.service.assignment(id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Office> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
