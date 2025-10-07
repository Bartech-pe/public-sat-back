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
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { CitizenAssistanceService } from './citizen-assistance.service';
import { CitizenAssistance } from './entities/citizen-assistance.entity';
import { CreateCitizenAssistanceDto } from './dto/create-citizen-assistance.dto';
import { UpdateCitizenAssistanceDto } from './dto/update-citizen-assistance.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing CitizenAssistance.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for CitizenAssistance.
 */
@ApiBearerAuth()
@Controller('citizen-assistances')
export class CitizenAssistanceController {
  constructor(private readonly service: CitizenAssistanceService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<CitizenAssistance>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(user, limit, offset);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CitizenAssistance> {
    return this.service.findOne(+id);
  }

  @Get('findByPortfolioDetail/:id')
  findByPortfolioDetail(@Param('id') id: number): Promise<CitizenAssistance[]> {
    return this.service.findByPortfolioDetail(+id);
  }

  @Get('findVerificacionByPortfolioDetail/:id')
  findVerificacionByPortfolioDetail(
    @Param('id') id: number,
  ): Promise<CitizenAssistance[]> {
    return this.service.findVerificacionByPortfolioDetail(+id);
  }

  @Get('findByDocIde/:docIde')
  findByDocIde(@Param('docIde') docIde: string): Promise<CitizenAssistance[]> {
    return this.service.findByDocIde(docIde);
  }

  @Post()
  create(@Body() dto: CreateCitizenAssistanceDto): Promise<CitizenAssistance> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCitizenAssistanceDto,
  ): Promise<CitizenAssistance> {
    return this.service.update(+id, dto);
  }

  @Put('toggleStatus/:id')
  toggleStatus(@Param('id') id: number): Promise<CitizenAssistance> {
    return this.service.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
