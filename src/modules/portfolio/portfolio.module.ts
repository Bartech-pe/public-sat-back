import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { PortfolioDetailModule } from '@modules/portfolio-detail/portfolio-detail.module';
import { CitizenModule } from '@modules/citizen/citizen.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Portfolio]),
    PortfolioDetailModule,
    CitizenModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioRepository],
  exports: [PortfolioRepository],
})
export class PortfolioModule {}
