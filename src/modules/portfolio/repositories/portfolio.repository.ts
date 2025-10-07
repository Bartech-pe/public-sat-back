import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Portfolio } from '../entities/portfolio.entity';

@Injectable()
export class PortfolioRepository extends GenericCrudRepository<Portfolio> {
  constructor(
    @InjectModel(Portfolio)
    model: typeof Portfolio,
  ) {
    super(model);
  }
}
