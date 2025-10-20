import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { PortfolioDetailService } from './portfolio-detail.service';
import { CreatePortfolioDetailDto } from './dto/create-portfolio-detail.dto';
import { UpdatePortfolioDetailDto } from './dto/update-portfolio-detail.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { PortfolioDetail } from './entities/portfolio-detail.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ReasignPortfolioDetailListDto } from './dto/reasign-portfolio-detail.dto';
import { CaseInformationDto } from './dto/case-information.dto';
import { CaseInformation } from './entities/case-information.entity';
import { CreatePortfolioAssignmentDto } from './dto/create-portfolio-assignment.dto';

@Controller('portfolio-details')
export class PortfolioDetailController {
  constructor(private readonly service: PortfolioDetailService) {}

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<PortfolioDetail>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.service.findAll(limit, offset);
  }

  @Get('detail/:id')
  findByCartera(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PortfolioDetail[]> {
    return this.service.findByPortfolioId(id);
  }

  @Get('detailByUserToken/:portfolioId')
  async findByUser(
    @CurrentUser() user: User,
    @Param('portfolioId') portfolioId: number,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<PortfolioDetail> & { managed: number }> {
    const limit = query.limit!;
    const offset = query.offset!;
    const res = await this.service.findByUserId(
      user?.id,
      portfolioId,
      limit,
      offset,
    );
    const count = await this.service.countManagedByUserIdAndPortfolioId(
      user.id,
      portfolioId,
    );
    return { ...res, managed: count };
  }

  @Get('detailByUserId/:id/:portfolioId')
  async findByUserId(
    @Param('id') id: number,
    @Param('portfolioId') portfolioId: number,
  ): Promise<PortfolioDetail[]> {
    return (await this.service.findByUserId(id, portfolioId)).data;
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<PortfolioDetail> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreatePortfolioDetailDto): Promise<PortfolioDetail> {
    return this.service.create(dto);
  }

  @Post('createOrUpdateInfoCaso/:id')
  createOrUpdateInfoCaso(
    @Param('idDetalle') idDetalle: number,
    @Body() dto: CaseInformationDto,
  ): Promise<CaseInformation> {
    return this.service.createOrUpdateInfoCaso(idDetalle, dto);
  }

  @Patch('reasigUser')
  reasigUser(
    @Body() body: ReasignPortfolioDetailListDto,
  ): Promise<PortfolioDetail[]> {
    return this.service.reasigUser(body.dtoList);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdatePortfolioDetailDto,
  ): Promise<PortfolioDetail> {
    return this.service.update(+id, dto);
  }

  @Put('togglePortfolioDetail/:id')
  togglePortfolioDetail(@Param('id') id: number): Promise<PortfolioDetail> {
    return this.service.togglePortfolioDetail(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Post('portfolio-assignments/multiple')
  createMultiple(@Body() dtoList: CreatePortfolioAssignmentDto[]) {
    return this.service.createMultiple(dtoList);
  }

  @Get('portfolio-assignments/details/:userId/:portfolioId')
  async findAssignmentByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
  ): Promise<PortfolioDetail[]> {
    return (await this.service.findByUserId(userId, portfolioId)).data;
  }
}
