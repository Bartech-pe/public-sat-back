import { Module } from '@nestjs/common';
import { DashboardReportService } from './dashboard-reports.service';
import { DashboardReportController } from './dashboard-reports.controller';
import { DashboardReportRepository } from './repositories/dashboard-report.repository';
import { DashboardReport } from './entities/dashboard-report.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([DashboardReport]),  
  ],
  controllers: [DashboardReportController],
  providers: [DashboardReportService, DashboardReportRepository],
  exports: [DashboardReportRepository]
})
export class DashboardReportModule {}
