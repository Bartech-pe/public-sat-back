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

import { TagsService } from './tags.service';
import { CreateTagsDto } from './dto/create-tag.dto';
import { UpdateTagsDto } from './dto/update-tag.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Tags } from './entities/tag.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
    findAll(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResponse<Tags>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Tags> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateTagsDto): Promise<Tags> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() dto: UpdateTagsDto,
    ): Promise<Tags> {
      return this.service.update(+id, dto);
    }
  
    @Put('toggleTags/:id')
    toggleTags(@Param('id') id: number): Promise<Tags> {
      return this.service.toggleTags(id);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
