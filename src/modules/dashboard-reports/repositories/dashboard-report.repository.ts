import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { DashboardReport } from '../entities/dashboard-report.entity';

/**
 * Repository for Reminder entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to Reminder in the future.
 */
@Injectable()
export class DashboardReportRepository extends GenericCrudRepository<DashboardReport> {
  constructor(
    @InjectModel(DashboardReport)
    model: typeof DashboardReport,
  ) {
    super(model);
  }
}
