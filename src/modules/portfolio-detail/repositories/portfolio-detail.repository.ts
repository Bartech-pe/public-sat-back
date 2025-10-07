import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { PortfolioDetail } from '../entities/portfolio-detail.entity';

@Injectable()
export class PortfolioDetailRepository extends GenericCrudRepository<PortfolioDetail> {
  constructor(
    @InjectModel(PortfolioDetail)
    model: typeof PortfolioDetail,
  ) {
    super(model);
  }
}
