import { PartialType } from '@nestjs/swagger';
import { CreateDashboardReportDto } from './create-dashboard-report.dto';

export class UpdateDashboardReportDto extends PartialType(
  CreateDashboardReportDto,
) {}
