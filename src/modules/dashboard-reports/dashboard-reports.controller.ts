import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DashboardReportService } from './dashboard-reports.service';
import { CreateDashboardReportDto } from './dto/create-dashboard-report.dto';
import { UpdateDashboardReportDto } from './dto/update-dashboard-report.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { DashboardReport } from './entities/dashboard-report.entity';
import { User } from '@modules/user/entities/user.entity';

@ApiTags('Dashboard Reports')
@ApiBearerAuth()
@Controller('dashboard-reports')
export class DashboardReportController {
  constructor(
    private readonly dashboardReportService: DashboardReportService,
  ) {}

  @Post()
  create(
    @Body() createReportDto: CreateDashboardReportDto,
    @CurrentUser() user: User,
  ) {
    return this.dashboardReportService.create(createReportDto, user?.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<DashboardReport>> {
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    return this.dashboardReportService.findAll(user, limit, offset, query?.q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardReportService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateDashboardReportDto,
  ) {
    return this.dashboardReportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardReportService.remove(+id);
  }
}
