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
import { QuickResponseFilter } from '../dto/quick-response-filter.dto';
import { QuickResponseService } from '../services/quickResponse.service';
import { CreateQuickResponseDto } from '../dto/create-quick-response.dto';
import { UpdateQuickResponseDto } from '../dto/update-quick-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QuickResponse } from '../entities/quick-response.entity';

/**
 * Controller for managing QuickResponse.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for QuickResponse.
 */
@ApiBearerAuth()
@Controller('quick-response')
export class QuickResponseController {
  constructor(private readonly quickResponseService: QuickResponseService) {}

  @Get()
  async findAll(
    @Query() filter: QuickResponseFilter,
  ): Promise<QuickResponse[]> {
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
