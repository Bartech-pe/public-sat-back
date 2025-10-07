import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { PortfolioAssignment } from '../entities/portfolio-assignment.entity';

/**
 * Repository for PortfolioAssignment entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to PortfolioAssignment in the future.
 */
@Injectable()
export class PortfolioAssignmentRepository extends GenericCrudRepository<PortfolioAssignment> {
  constructor(
    @InjectModel(PortfolioAssignment)
    model: typeof PortfolioAssignment,
  ) {
    super(model);
  }
}
