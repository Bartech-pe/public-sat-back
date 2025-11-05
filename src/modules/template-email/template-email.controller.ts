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
import { TemplateEmailService } from './template-email.service';
import { CreateTemplateEmailDto } from './dto/create-template-email.dto';
import { UpdateTemplateEmailDto } from './dto/update-template-email.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { TemplateEmail } from './entities/template-email.entity';

@Controller('template-email')
export class TemplateEmailController {

  constructor(private readonly service: TemplateEmailService) {}

  @Get()
    findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<TemplateEmail>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<TemplateEmail> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateTemplateEmailDto): Promise<TemplateEmail> {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateTemplateEmailDto): Promise<TemplateEmail> {
      return this.service.update(+id, dto);
    }
  
    @Put('toggleTag/:id')
    toggleTag(@Param('id') id: number): Promise<TemplateEmail> {
      return this.service.toggleTag(id);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
