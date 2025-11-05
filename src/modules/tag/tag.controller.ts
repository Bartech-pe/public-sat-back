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

import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Tag } from './entities/tag.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly service: TagService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<Tag>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Tag> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateTagDto): Promise<Tag> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTagDto): Promise<Tag> {
    return this.service.update(+id, dto);
  }

  @Put('toggleTag/:id')
  toggleTag(@Param('id') id: number): Promise<Tag> {
    return this.service.toggleTag(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
