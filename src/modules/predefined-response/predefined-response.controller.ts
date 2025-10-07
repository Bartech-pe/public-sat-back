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
import { PredefinedResponseService } from './predefined-response.service';
import { CreatePredefinedResponseDto } from './dto/create-predefined-response.dto';
import { UpdatePredefinedResponseDto } from './dto/update-predefined-response.dto';
import { PredefinedResponse } from './entities/predefined-response.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Controller('predefined-response')
export class PredefinedResponseController {
  constructor(private readonly service: PredefinedResponseService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<PredefinedResponse>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get('allMail')
  allPredefinedResponseMail(): Promise<PredefinedResponse[]> {
    return this.service.allPredefinedResponseMail();
  }

  @Get('allChatSat')
  allPredefinedResponseChatSat(): Promise<PredefinedResponse[]> {
    return this.service.allPredefinedResponseChatSat();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<PredefinedResponse> {
    return this.service.findOne(+id);
  }

  @Post()
  create(
    @Body() dto: CreatePredefinedResponseDto,
  ): Promise<PredefinedResponse> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdatePredefinedResponseDto,
  ): Promise<PredefinedResponse> {
    return this.service.update(+id, dto);
  }

  @Put('togglePredefinedResponse/:id')
  togglePredefinedResponse(
    @Param('id') id: number,
  ): Promise<PredefinedResponse> {
    return this.service.togglePredefinedResponse(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
