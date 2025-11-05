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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Team } from './entities/team.entity';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { TeamUser } from './entities/team-user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('teams')
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @ApiBearerAuth()
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Team>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset, query.q);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Team> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateTeamDto): Promise<Team> {
    return this.service.create(dto);
  }

  @Post('assignment/:id')
  assignment(
    @Param('id') id: number,
    @Body() dto: CreateTeamUserDto[],
  ): Promise<TeamUser[]> {
    return this.service.assignment(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTeamDto): Promise<Team> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Team> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
