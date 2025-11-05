import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { QuickResponseFilter } from '../dto/QuickResponseFilter';
import { QuickResponseService } from '../services/quickResponse.service';
import { CreateQuickResponseDto } from '../dto/CreateQuickResponseDto';
import { UpdateQuickResponseDto } from '../dto/UpdateQuickResponse';

@Controller('quick-response')
export class QuickResponseController {
  constructor(private readonly quickResponseService: QuickResponseService) {}

  @Get()
  async findAll(@Query() filter: QuickResponseFilter) {
    const response = await this.quickResponseService.findAll(filter);
    return response;
  }
  @Post()
  async create(@Body() body: CreateQuickResponseDto) {
    const response = await this.quickResponseService.createQuickResponse(body);
    return response;
  }
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateQuickResponseDto,
  ) {
    return await this.quickResponseService.updateQuickResponse(id, body);
  }
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.quickResponseService.deleteQuickResponse(id);
  }
}
