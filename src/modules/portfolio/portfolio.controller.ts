import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly service: PortfolioService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Portfolio>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset, query.q);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Portfolio> {
    return this.service.findOne(+id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePortfolioDto })
  create(
    @Body() dto: CreatePortfolioDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Portfolio> {
    return this.service.create(dto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: number,
    @Body() dto: UpdatePortfolioDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Portfolio> {
    return this.service.update(+id, dto, file);
  }

  @Get('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<Portfolio> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
