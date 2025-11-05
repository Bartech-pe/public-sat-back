import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleScreenDto } from './dto/create-role-screen.dto';
import { RoleScreen } from './entities/role-screen.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Role>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Role> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.service.create(dto);
  }

  @Post('assignment/:id')
  assignment(
    @Param('id') id: number,
    @Body() dto: CreateRoleScreenDto[],
  ): Promise<RoleScreen[]> {
    return this.service.assignment(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto): Promise<Role> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Role> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
