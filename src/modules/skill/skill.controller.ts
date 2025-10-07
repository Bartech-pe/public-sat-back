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
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Skill } from './entities/skill.entity';
import { CreateSkillUserDto } from './dto/create-skill-user.dto';
import { SkillUser } from './entities/skill-user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('skills')
export class SkillController {
  constructor(private readonly service: SkillService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Skill>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Skill> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateSkillDto): Promise<Skill> {
    return this.service.create(dto);
  }

  @Post('assignment/:id')
  assignment(
    @Param('id') id: number,
    @Body() dto: CreateSkillUserDto[],
  ): Promise<SkillUser[]> {
    return this.service.assignment(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSkillDto): Promise<Skill> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Skill> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
