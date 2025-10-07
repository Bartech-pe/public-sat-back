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
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { VicidialApiService } from '@modules/vicidial/vicidial-api/vicidial-api.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly vicidialService: VicidialApiService,
  ) {}

  @ApiBearerAuth()
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<User>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  @ApiBearerAuth()
  @Get('roles/:roleId')
  findAllRolId(@Param('roleId') roleId: number): Promise<User[]> {
    return this.service.findAllRolId(+roleId);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.service.findOne(+id);
  }

  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    if (dto.vicidial) {
      await this.vicidialService.createAgent({
        ...dto.vicidial,
        fullname: dto.name,
      });
    }
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    if (dto.vicidial) {
      await this.vicidialService.createAgent({
        ...dto.vicidial,
        fullname: dto.name!,
      });
    }
    return this.service.update(+id, dto);
  }

  @ApiBearerAuth()
  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<User> {
    return this.service.toggleStatus(id);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
